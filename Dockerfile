# Set the base image to Ubuntu
FROM ubuntu:14.04

RUN apt-get update -y
RUN apt-get upgrade -y

RUN apt-get install nodejs -y
RUN apt-get install nodejs-legacy -y
RUN apt-get install npm -y

# Install package dependencies 

# gdal
RUN apt-get install libgdal-dev -y 


# Install nodemon
RUN npm install -g nodemon

# Define working directory
ADD . /code
WORKDIR /code



RUN npm install

# Expose port
EXPOSE  3000

# Run app using nodemon
CMD ["nodemon", "bin/www"]