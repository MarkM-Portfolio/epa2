#!/bin/bash

docker system prune -a --volumes --force # Enable to delete volumes & clear up some storage space
docker build -t epa_setup:latest .
docker container stop epa >> /dev/null 2<&1
docker container rm epa >> /dev/null 2<&1
docker run -t -d -p 8080:5000 -v ~/epa/server/assets:/home/node/epa/server/assets --name epa epa_setup:latest

declare -a DEL_IMGS=(`docker image ls | grep '<none>' | awk '{print$3}'`)

echo -e "\nRemoving unused docker images..."

for i in ${DEL_IMGS}; do
    echo $i
    docker image rm $i
done 

echo -e "\n\nNOW ONLINE!! Go to site >> https://${DOMAIN}"
