# PaintingWithData
Urban computing platform through voxels and a graph backend. The application proposes a new urban mapping paradigm.

## Painting With Data History
Some

## Current Painting With Data Implementation
Some

## Development
The app uses a [PostGIS](https://postgis.net/) database and a [Neo4j](http://neo4j.com/) graph database. 

This site is built as a [Node.js](https://nodejs.org/en/) application. It uses [React.js](https://facebook.github.io/react/) for the UI development and [Flux.js](https://facebook.github.io/react/blog/2014/05/06/flux.html) as a framework.

* `git clone https://github.com/cesandoval/PaintingWithData.git`
* Install [node & npm](https://nodejs.org/en/)
* Install [bower](http://bower.io/)
* `cd` into the webapp directory
* `npm install` will install all the node modules needed locally for development.
* `npm start` to view website locally

## Starting
* Run on browser `http://localhost:3000/`

##Code Appendix
* **data**
    * `points.json` 
    
        Precomputed JSON including all the voxel layers and point values

* **public**

    Contains all the client-side code and style sheets

    * **stylesheets**

        Contains all the stylesheets

        * `base.css`

            Contains the majority of the css styles

        * `d3.parcoords.css`

            Contains styles for the parallel coordinates widget

        * `graph-creator.css`

            Contains styles for the visual programming widget

        * `jquery-ui.css`

            Base jquery UI styles. Some modifications for the application

        * `spectrum.css`

            Base styles for the color picker. Some modifications for the application

    * **javascripts**
        Contains the frontend code

        * **js**
        
            Contains libraries required by the client-side code
            
            * `d3.js`

            * `d3.parcoords.js`
            
            * `jquery-1.11.3.js`
            
            * `jquery-ui.js`
            
            * `OrbitControls.js`
            
            * `spectrum.js`
            
            * `three.js`

        * **voxel**

            Contains a placeholder geometry library

            * `PixelGrid.js`

                Currently implements a simple neighborhood index, property setters, coordinate setters, and neighborhood queries

        * `graph-creator.js`
        
            Contains the code for the visual programming language widget. Additional nodes can be added here.

        * `parallel_coordinates.js`
        
            Contains code to construct and populate the parallel coordinates widget

        * `three_voxel.js`
        
            Contains the code to construct the client-side of the application, makes calls to the other scripts to construct the UI and interact with the user

        * `uiVoxel.js`

            Contains code to construct the elements of the UI; mainly used for constructing buttons, sidebars, etc with jquery


### Copyright (c) 2016, Carlos Sandoval Olascoaga. All rights reserved.

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