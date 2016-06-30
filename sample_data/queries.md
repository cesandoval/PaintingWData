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
`raster2pgsql -s 2263 -I -C -M sample_data/raster/asthma_3.tif -F -t 10x10 public.asthma_raster5 > asthma.sql`
`psql -U postgres -d PaintingWithData_Riyadh -f asthma.sql`

#### A conversion and upload can be done all in one step using UNIX pipes:
`raster2pgsql -s 2263 -I -C -M sample_data/raster/asthma_3.tif -F -t 100x100 public.asthma_raster | psql -d PaintingWithData_Riyadh`
