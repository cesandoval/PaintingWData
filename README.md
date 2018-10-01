# PaintingWithData_Riyadh
Urban computing platform through voxels and a graph backend. The proposes a new urban mapping paradigm. 

![alt text](https://github.com/cesandoval/PaintingWithData_Riyadh/blob/master/public/images/painting_with_data.PNG "Painting With Data Interface")

## Development
The app uses a [PostGIS](https://postgis.net/) database. For development, we are using a Postgres DB hosted as a RDS instance on AWS. The access to the DB is guarded by a firewall. IP addresses at MIT are generally allowed.  

This site is built as a [Node.js](https://nodejs.org/en/) application. It uses [React.js](https://facebook.github.io/react/) for the app UI development ,[Flux.js](https://facebook.github.io/react/blog/2014/05/06/flux.html), and [Express](http://expressjs.com/) as a framework. The data processing pages are built with [Vue.js](https://vuejs.org/)

### Required Dependecies:
* [Redis](https://redis.io/topics/quickstart)
* [Node](https://nodejs.org/en/)
* [Yarn](https://yarnpkg.com/en/)


### Node Global Modules:
* On a terminal, run the following commands:
```
npm -g install sequelize-cli
npm -g install nodemon
npm install -g gulp-cli
```

### Building for Development
* `git clone https://github.com/cesandoval/PaintingWithData_Riyadh.git`
* `cd` into the webapp directory
* `yarn` will install all the node and bower modules needed locally for development.

* If modifying the `/Private` Code, run the command `gulp`. This task-runner will bundle all of the code that has changed.
* Add the following environment variables to your system:
```
export USEREMAIL=AKIAI4QPMNW3UXUB55YA
export EMAILPASSWORD=AtdHdvxSwNx8NA1lsdD66Wj/rjQXvRCiI+NCqeWr529L
export FACEBOOKCLIENTID=154768358572404
export FACEBOOKCLIENTSECRET=d408b451927e43bf3be6b006e7ea5446
export GOOGLECLIENTID=67861958495-4m4u9kpfs7j9pgl51i6nvrr5o0ooc13c.apps.googleusercontent.com
export GOOGLECLIENTSECRET=l-uxbq7ClvEKI-PLt_AtGpL1
export AWS_ACCESS_KEY_ID=AKIAJCX4CWAJWIAX7B6A
export AWS_SECRET_ACCESS_KEY=2LFEyIqbH7tzbcdCqNo9GFluAVsF7I5Y0atqYC3t
```
 * Confirm you have the appropriate mail credentials on the path, otherwise, add the credentials to your path. 
 * `ECHO $USEREMAIL
 ECHO $EMAILPASSWORD`

## Starting the Server
* Run the following command to create the database files:
```
$ yarn db:migrate
```
or 
```
$ npm db:migrate
```

* To add a new migration to add a column to a model:
```
$ cd app
$ sequelize migration:create
```
Then edit the newly created `js` file:
```
module.exports = {
  up: function(queryInterface, Sequelize) {
    // logic for transforming into the new state
    queryInterface.addColumn(
      'Todo',
      'completed',
     Sequelize.BOOLEAN
    );

  },

  down: function(queryInterface, Sequelize) {
    // logic for reverting the changes
    queryInterface.removeColumn(
      'Todo',
      'completed'
    );
  }
}
```
* Start **redis server**:
    * Google search: `install/connect to redis server locally`
    * On OSX: `redis-server /usr/local/etc/redis.conf`

## Develope the pages with VUE

``` bash
## watch & run vueify build
yarn dev:vue

```


## Build and Server Setup

``` bash
# install dependencies
npm install

# build for production
npm run build

# serve in production mode at localhost:3000
npm run start

# serve with [hot reload] at localhost:3000
npm run dev


```

## Middlewares (a part of, to be confirmed)
### `/upload`
- desc: upload a dataset, this function verifies the zip file, checks the projections and creates `Datafiles`. It checks the size of the uploaded file and adds that to the object. A lot of the functionality of this controller is handled by `public/javascripts/fileUpload.js`. 
- `post` When data is posted, it is redirected to `/uploadViewer`, where the user has the capacity to name the dataset. 
    - data: `{string} filepath`
    - res: `res.send({id: d.id+'$$'+size})`

### `/uploadViewer/:id`
- desc: Once a zip file has been uploaded and a `Datafile` has been created, prompt the user for some extra information to save the dataset and create `Datalayers`. 
- `get` method
    - data: `{object} req` Contains the `id` if the `Datafile`, and is parsed to get the `fileSize`
    - res: `res.render('uploadViewer', {id: id, userSignedIn: req.isAuthenticated(), user: req.user, size: size, accountAlert: req.flash('accountAlert')[0]});`
- `post` Saves the shapes by triggering a worker that iteratively parses and saves every geometry into a `Datalayer` and a `DataDBF`. 
    - data: `{object} req` Contains `req.body.rasterProperty`, `req.body.datafileId`, `req.body.layername`, `req.body.description`, `req.body.location`, `req.body.epsg`
    - res: `res.render('uploadViewer', {id: id, userSignedIn: req.isAuthenticated(), user: req.user, size: size, accountAlert: req.flash('accountAlert')[0]});`

### `/layers`
- desc: create a new project by selecting property/properties of one or multiple datasets
- `post` method
    - data: `[...]`

### `/datasets`
- desc: create a new project by selecting property/properties of one or multiple datasets
- `post` method
   - data: 
```
  {
      user:{
        'id': req.user.id
      },
      body:  
      { voxelname: 'name',
        datalayerIds: '{"46":"OBJECTID","55":"OBJECTID;ALAND10"}',
        voxelDensity: '11739',
        layerButton: 'compute' 
      }
  }

```


## Frontend libraries and platforms:
* [three.js](https://threejs.org/)
* [D3](https://d3js.org/)
* [mapbox](https://www.mapbox.com/)
