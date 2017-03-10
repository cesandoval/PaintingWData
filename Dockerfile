# Set the base image to Ubuntu
FROM ubuntu:14.04

RUN apt-get update -y
RUN apt-get upgrade -y
RUN apt-get install curl -y
RUN apt-get install git -y 

RUN curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
RUN apt-get install -y nodejs

# Install package dependencies 

# gdal
#RUN apt-get install libgdal-dev -y 


# Install nodemon
RUN npm install -g nodemon


# Define working directory
COPY . /usr/src/app

WORKDIR /usr/src/app


RUN npm install gdal --save
RUN npm install --save sequelize
RUN npm install --save pg pg-hstore
RUN npm install -g sequelize-cli
RUN npm install

WORKDIR app
RUN sequelize db:migrate 

WORKDIR /usr/src/app



# Expose port
EXPOSE  3000

# Run app using nodemon
CMD ["nodemon", "bin/www"]