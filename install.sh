#!/bin/bash
sudo service redis-server start 

# Modify IPtables 
sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 3000 
sudo iptables -t nat -L --line-numbers 
 
# Start NGinx at reboot 
sudo chkconfig nginx on 

# Mount EFS 
sudo mount -t nfs4 -o nfsvers=4.1,rsize=1048576,wsize=1048576,hard,timeo=600,retrans=2 fs-ec8164f5.efs.us-west-1.amazonaws.com:/ /var/www/PaintingWithData_Riyadh/lib/shape_files

# CD into app 
# cd /var/www/PaintingWithData_Riyadh 