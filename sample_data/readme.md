# Creating PostGIS Tables
#### SQL Query
```
CREATE TABLE DATALAYER ( ID int4, LAYER_NAME varchar(50), geom geometry);
```

# Loading geospatial files manually into the PostGIS DB
All the files are located in `sample data`
## SRID: 2263

## Load the shapefile into the database in one step
`shp2pgsql -I -s <SRID> <PATH/TO/SHAPEFILE> <SCHEMA>.<DBTABLE> | psql -U postgres -d <DBNAME>`

### Sample Query 
`shp2pgsql -I -s 2263 sample_data/shp/Risk_cancerresp.shp public.cancer_risk | psql -U postgres -d PaintingWithData_Riyadh`

### Sample Query PTS
`shp2pgsql -I -s 2263 sample_data/shp/cancer_pt3.shp public.cancer_pts | psql -U postgres -d PaintingWithData_Riyadh`

#### If you want to capture the SQL commands, pipe the output to a file:
`shp2pgsql -I -s <SRID> <PATH/TO/SHAPEFILE> <DBTABLE> > SHAPEFILE.sql`

## Loading Rasters
```
RASTERS
raster2pgsql  -s <srid>       #The srid you chose.
              -t WIDTHxHEIGH  #Dimensions of each block that contains your data. usually 50x50 for vector/raster analysis is good.
              -f              #Name of raster column. Usually named rast
              -I              #Create Gist index. You want this for using spatial indexes.
              -Y              #Use copy instead of insert when importing the data. Much faster. harder to debug if there are problems.
```

### Sample Query: Two Steps
#### Asthma Dataset
`raster2pgsql -s 2263 -I -C -M sample_data/raster/asthma_3.tif -F -t 10x10 public.asthma_raster5 > asthma.sql`
`psql -U postgres -d PaintingWithData_Riyadh -f asthma.sql`

#### Cancer Dataset
`raster2pgsql -s 2263 -I -C -M sample_data/raster/cancer.tif -F -t 10x10 public.cancer_raster2 > raster_c.sql`
`psql -U postgres -d PaintingWithData_Riyadh -f raster_c.sql`

#### A conversion and upload can be done all in one step using UNIX pipes:
`raster2pgsql -s 2263 -I -C -M sample_data/raster/asthma_3.tif -F -t 100x100 public.asthma_raster | psql -d PaintingWithData_Riyadh`


## Sample a Raster With a Point Net
### Get all values in band 1
```
SELECT ST_AsGeoJSON(p.geom), ST_Value(r.rast, 1, p.geom, false) As rastervalue
	FROM public.cancer_pts AS p, public.cancer_raster2 AS r
		WHERE ST_Intersects(r.rast,p.geom);
```
### Get all values in band 1, and save them as a new table
```
CREATE TABLE cancer_pt_values AS 
SELECT p.gid, ST_AsGeoJSON(p.geom) AS geoJSON, ST_Value(r.rast, 1, p.geom, false) As rastervalue
	FROM public.cancer_pts AS p, public.cancer_raster2 AS r
		WHERE ST_Intersects(r.rast,p.geom);
```

```
SELECT row_to_json(fc)
 FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features
 FROM (SELECT 'Feature' As type
    , ST_AsGeoJSON(lg.geom)::json As geometry
    , row_to_json(lp) As properties
   FROM public.cancer_pts As lg 
         INNER JOIN (SELECT rastervalu FROM public.cancer_pts) As lp 
       ON lg.id = lp.id  ) As f )  As fc;
```

### Testing to convert a query into a single geoJSON
```
SELECT row_to_json(fc)
 FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features
 FROM (SELECT 'Feature' As type
    , ST_AsGeoJSON(lg.geom)::json As geometry
    , row_to_json((SELECT l FROM (SELECT rastervalu) As l
      )) As properties
   FROM public.cancer_pts As lg   ) As f )  As fc;
```

```
SELECT row_to_json(featcoll)
   FROM 
    (SELECT 'FeatureCollection' As type, array_to_json(array_agg(feat)) As features
     FROM (SELECT 'Feature' As type,
        ST_AsGeoJSON(tbl.geom)::json As geometry,
       row_to_json((SELECT l FROM (SELECT gid, id) As l)
  ) As properties
  FROM public.cancer_pts As tbL   
 )  As feat 
)  As featcoll; 
```

## Sample a Raster into Points and Values
### Get all values in bands 1,2,3 of each pixel same as above but returning the upper left point point of each pixel --
```
SELECT ST_AsText(ST_SetSRID(
	ST_Point(ST_UpperLeftX(rast) + ST_ScaleX(rast)*x, 
		ST_UpperLeftY(rast) + ST_ScaleY(rast)*y), 
		ST_SRID(rast))) As uplpt
    , ST_Value(rast, 1, x, y) 
FROM public.cancer_raster2 CROSS JOIN
generate_series(1,1000) As x CROSS JOIN generate_series(1,1000) As y
WHERE rid =  2 AND x <= ST_Width(rast) AND y <= ST_Height(rast);

            uplpt            | b1val 
-----------------------------+-------
 POINT(3427929.25 5793245.5) |   253 
 POINT(3427929.25 5793247)   |   253 
 POINT(3427929.25 5793248.5) |   250 
:
```

```
--- Get all values in bands 1,2,3 of each pixel --
SELECT x, y, ST_Value(rast, 1, x, y) As b1val
FROM public.asthma_raster5 CROSS JOIN
generate_series(1, 10000) As x CROSS JOIN generate_series(1, 10000) As y
WHERE rid =  2 AND x <= ST_Width(rast) AND y <= ST_Height(rast);
```

```
ST_Value(public.cancer_raster2, 1, 1, false);
```

```
--- Checking all the pixels of a large raster tile can take a long time.
--- You can dramatically improve speed at some lose of precision by orders of magnitude 
--  by sampling pixels using the step optional parameter of generate_series.  
--  This next example does the same as previous but by checking 1 for every 4 (2x2) pixels and putting in the last checked
--  putting in the checked pixel as the value for subsequent 4
	
SELECT ST_AsText(ST_Union(pixpolyg)) As shadow
FROM (SELECT ST_Translate(ST_MakeEnvelope(
		ST_UpperLeftX(rast), ST_UpperLeftY(rast), 
			ST_UpperLeftX(rast) + ST_ScaleX(rast)*2,
			ST_UpperLeftY(rast) + ST_ScaleY(rast)*2, 0
			), ST_ScaleX(rast)*x, ST_ScaleY(rast)*y
		) As pixpolyg, ST_Value(rast, 2, x, y) As b2val
	FROM public.cancer_raster2 CROSS JOIN
generate_series(1,1000,2) As x CROSS JOIN generate_series(1,1000,2) As y
WHERE rid =  2 
	AND x <= ST_Width(rast)  AND y <= ST_Height(rast)  ) As foo
WHERE  
	ST_Intersects(
		pixpolyg, 
		ST_GeomFromText('POLYGON((3427928 5793244,3427927.75 5793243.75,3427928 5793243.75,3427928 5793244))',0)
		) AND b2val != 254;

		shadow
------------------------------------------------------------------------------------
 MULTIPOLYGON(((3427927.9 5793243.85,3427927.8 5793243.85,3427927.8 5793243.95,
 3427927.9 5793243.95,3427928 5793243.95,3427928.1 5793243.95,3427928.1 5793243.85,3427928 5793243.85,3427927.9 5793243.85)),
 ((3427927.9 5793243.65,3427927.8 5793243.65,3427927.8 5793243.75,3427927.8 5793243.85,3427927.9 5793243.85,
 3427928 5793243.85,3427928 5793243.75,3427928.1 5793243.75,3427928.1 5793243.65,3427928 5793243.65,3427927.9 5793243.65)))
 ```

 ```
 SELECT ST_AsText(ST_SetSRID(
	ST_Point(ST_UpperLeftX(rast) + ST_ScaleX(rast)*x, 
		ST_UpperLeftY(rast) + ST_ScaleY(rast)*y), 
		ST_SRID(rast))) As uplpt
    , ST_Value(rast, 1, x, y) As b1val, 
	ST_Value(rast, 2, x, y) As b2val, ST_Value(rast, 3, x, y) As b3val
FROM public.cancer_raster2 CROSS JOIN
generate_series(1,1000) As x CROSS JOIN generate_series(1,1000) As y
WHERE rid =  2 AND x <= ST_Width(rast) AND y <= ST_Height(rast);
```

