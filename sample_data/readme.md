# Loading geospatial files manually into the PostGIS DB
All the files are located in `sample data`
## SRID: 2263

## Load the shapefile into the database in one step
`shp2pgsql -I -s <SRID> <PATH/TO/SHAPEFILE> <SCHEMA>.<DBTABLE> | psql -U postgres -d <DBNAME>`
### Sample Query 
`shp2pgsql -I -s 2263 sample_data/shp/Risk_cancerresp.shp public.cancer_risk | psql -U postgres -d PaintingWithData_Riyadh`

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