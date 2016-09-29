# PaintingWithData_Riyadh
Urban computing platform through voxels and a graph backend. The proposes a new urban mapping paradigm. Riyadh Implementation of Painting with Data. 

![alt text](https://github.com/cesandoval/PaintingWithData_Riyadh/blob/master/public/images/painting_with_data.PNG "Painting With Data Interface")

## Painting With Data History
Some

## Current Painting With Data Implementation
Some

## Development
The app will use a [PostGIS](https://postgis.net/) database and a [Neo4j](http://neo4j.com/) graph database. 

This site is built as a [Node.js](https://nodejs.org/en/) application. It uses [React.js](https://facebook.github.io/react/) for the UI development ,[Flux.js](https://facebook.github.io/react/blog/2014/05/06/flux.html), and [Express](http://expressjs.com/) as a framework.

* `git clone https://github.com/cesandoval/PaintingWithData.git`
* Install [node & npm](https://nodejs.org/en/)
* `cd` into the webapp directory
* `npm install` will install all the node and bower modules needed locally for development.
* Download and install PostgreSQL [here](https://www.postgresql.org/download/). [Install](http://postgis.net/install/) the postGIS extension for PostgreSQL.
* Username should be `postgres`, and password `postgrespass`. An installation guide can be found [here](http://www.bostongis.com/PrinterFriendly.aspx?content_name=postgis_tut01).
* Using the PostgreSQL's UI pgAdminIII, or the [command line](http://gis.stackexchange.com/questions/71130/how-to-create-a-new-gis-database-in-postgis), create a DB based on a postGIS template. The user should be `postgres`, the pw `postgrespass`, and the DB name should be `PaintingWithData_Riyadh`. 


## Starting
* Run the following command to create the datbase files:
```
$ cd app
$ sequelize db:migrate
```
* run `npm start` to start the server 
* Run on browser `http://localhost:3000/` to view the website locally

## Copyright (c) 2016, Carlos Sandoval Olascoaga, CDDL, KACST. All rights reserved.

Redistribution and use in source form, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
list of conditions and the following disclaimer in the documentation
and/or other materials provided with the distribution.

2. Neither the name of the copyright holder nor the names of its contributors
may be used to endorse or promote products derived from this software without
specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
