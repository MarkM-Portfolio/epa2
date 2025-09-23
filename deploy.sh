#!/bin/bash

echo -e "\n---++--- [ Deploying Updates to PROD ] ---++---"

REPO_NAME="epa"
KEY_NAME="epa"
HOST_NAME="epa"
CONTAINER_NAME="epa"
NODE_USERID="1000"

echo -e "\nPreparing Local Build..." # remove later after refactor
rm -rf ${PWD}/app/build # remove later after refactor
cd ${PWD}/app && npm run build # remove later after refactor
cd - # remove later after refactor

echo -e "\nAuthenticating to Server..."
echo -e "\nNODE Version: $(node -v)"
echo -e "NPM Version: $(npm -v)\n"
ssh-add ~/.ssh/$KEY_NAME &> /dev/null
ssh -A -i ~/.ssh/$KEY_NAME $HOST_NAME "eval `ssh-agent -s`" &> /dev/null
scp ~/.ssh/$KEY_NAME $HOST_NAME:/tmp &> /dev/null
ssh -A -i ~/.ssh/$KEY_NAME $HOST_NAME "ssh-add /tmp/$KEY_NAME" &> /dev/null
ssh -A -i ~/.ssh/$KEY_NAME $HOST_NAME "rm /tmp/$KEY_NAME"

ssh -A -i ~/.ssh/$KEY_NAME $HOST_NAME "chown -R $NODE_USERID:$NODE_USERID ~/$REPO_NAME/server/assets"

# status_code=`ssh -A -i ~/.ssh/$KEY_NAME $HOST_NAME docker container ps | grep $CONTAINER_NAME &> /dev/null; echo $?`
# if [[ `echo $status_code` != 0 ]]; then
# 	echo -e "\nCreating Docker Container..."
# 	ssh -A -i ~/.ssh/$KEY_NAME $HOST_NAME "cd ~/$REPO_NAME && ./docker_run.sh"
# fi
# NOTE: RUN Manually docker_run.sh in PROD

# is_new_pkg=`ssh -A -i ~/.ssh/$KEY_NAME $HOST_NAME sh -c cd ~/$REPO_NAME && git pull | grep package; echo $?`
# if [[ `echo $is_new_pkg` == 0 ]]; then
# 	echo -e "\nNew NPM Package Detected..."
# 	echo -e "\nInstalling NPM Packages..."
# 	echo -e "\nPreparing Local Build..."
# 	cd ${PWD}/server && npm install && npm audit fix
# 	cd ${PWD}/app && npm install && npm audit fix && npm run build
# 	echo -e "\nDeploying NPM Packages..."
# 	ssh -A -i ~/.ssh/$KEY_NAME $HOST_NAME "docker exec $CONTAINER_NAME rm -rf /home/node/$REPO_NAME/app/package.json /home/node/$REPO_NAME/app/package-lock.json"
# 	ssh -A -i ~/.ssh/$KEY_NAME $HOST_NAME "docker exec $CONTAINER_NAME rm -rf /home/node/$REPO_NAME/server/package.json /home/node/$REPO_NAME/server/package-lock.json"
# 	ssh -A -i ~/.ssh/$KEY_NAME $HOST_NAME "docker cp ~/$REPO_NAME/app/package.json $CONTAINER_NAME:/home/node/$REPO_NAME/app"
# 	ssh -A -i ~/.ssh/$KEY_NAME $HOST_NAME "docker cp ~/$REPO_NAME/app/package-lock.json $CONTAINER_NAME:/home/node/$REPO_NAME/app"
# 	ssh -A -i ~/.ssh/$KEY_NAME $HOST_NAME "docker cp ~/$REPO_NAME/server/package.json $CONTAINER_NAME:/home/node/$REPO_NAME/server"
# 	ssh -A -i ~/.ssh/$KEY_NAME $HOST_NAME "docker cp ~/$REPO_NAME/server/package-lock.json $CONTAINER_NAME:/home/node/$REPO_NAME/server"
# 	ssh -A -i ~/.ssh/$KEY_NAME $HOST_NAME "docker exec $CONTAINER_NAME sh -c 'cd /home/node/$REPO_NAME/app && npm i && npm ci && npm cache clean --force'"
# 	ssh -A -i ~/.ssh/$KEY_NAME $HOST_NAME "docker exec $CONTAINER_NAME sh -c 'cd /home/node/$REPO_NAME/server && npm ci && npm cache clean --force'"
# 	cd -
# fi

# is_latest=`ssh -A -i ~/.ssh/$KEY_NAME $HOST_NAME sh -c cd ~/$REPO_NAME && git pull`
# if [[ `echo $is_latest` != "Already"* ]]; then
# 	echo -e "\nPreparing Local Build..."
# 	rm -rf ${PWD}/app/build
# 	cd ${PWD}/app && npm run build
# 	cd -
# fi

# ssh -A -i ~/.ssh/$KEY_NAME $HOST_NAME sh -c cd ~/$REPO_NAME && git pull # remove later after refactor
# echo -e "\nPreparing Local Build..." # remove later after refactor
# rm -rf ${PWD}/app/build # remove later after refactor
# cd ${PWD}/app && npm run build # remove later after refactor
# cd - # remove later after refactor

echo -e "\nDeploying Latest Build..."
rsync -avzh --progress ${PWD}/server/.env $HOST_NAME:~/$REPO_NAME/server
rsync -avzh --progress ${PWD}/server/server.cert $HOST_NAME:~/$REPO_NAME/server
rsync -avzh --progress ${PWD}/server/server.key $HOST_NAME:~/$REPO_NAME/server
ssh -A -i ~/.ssh/$KEY_NAME $HOST_NAME "chown ${NODE_USERID}:${NODE_USERID} ~/$REPO_NAME/server/.env ~/$REPO_NAME/server/server.cert ~/$REPO_NAME/server/server.key"
rsync -avzh --progress ${PWD}/app/build/ $HOST_NAME:~/$REPO_NAME/app/build
ssh -A -i ~/.ssh/$KEY_NAME $HOST_NAME "chown -R ${NODE_USERID}:${NODE_USERID} ~/$REPO_NAME/app/build"

echo -e "\nCreating Docker Image & Containers..."

ssh -A -i ~/.ssh/$KEY_NAME $HOST_NAME "cd /root/$REPO_NAME && git pull && ./docker_run.sh"

echo -e "\nHousekeeping..."
ssh -A -i ~/.ssh/$KEY_NAME $HOST_NAME "docker exec $CONTAINER_NAME rm -rf /home/node/$REPO_NAME/server/.env /home/node/$REPO_NAME/server/server.cert /home/node/$REPO_NAME/server/server.key"
ssh -A -i ~/.ssh/$KEY_NAME $HOST_NAME "docker exec $CONTAINER_NAME rm -rf /home/node/$REPO_NAME/app/build"
ssh -A -i ~/.ssh/$KEY_NAME $HOST_NAME "docker cp ~/$REPO_NAME/server/.env $CONTAINER_NAME:/home/node/$REPO_NAME/server"
ssh -A -i ~/.ssh/$KEY_NAME $HOST_NAME "docker cp ~/$REPO_NAME/server/server.cert $CONTAINER_NAME:/home/node/$REPO_NAME/server"
ssh -A -i ~/.ssh/$KEY_NAME $HOST_NAME "docker cp ~/$REPO_NAME/server/server.key $CONTAINER_NAME:/home/node/$REPO_NAME/server"
ssh -A -i ~/.ssh/$KEY_NAME $HOST_NAME "docker cp ~/$REPO_NAME/app/build $CONTAINER_NAME:/home/node/$REPO_NAME/app"
ssh -A -i ~/.ssh/$KEY_NAME $HOST_NAME "rm -rf ~/$REPO_NAME/server/.env ~/$REPO_NAME/server/server.cert ~/$REPO_NAME/server/server.key ~/$REPO_NAME/app/build"

echo -e "\nReloading Apache Server..."
ssh -A -i ~/.ssh/$KEY_NAME $HOST_NAME "systemctl reload apache2"

health_check() {
	echo -e "\nRestarting Container..."
	ssh -A -i ~/.ssh/$KEY_NAME $HOST_NAME "docker stop $CONTAINER_NAME" &> /dev/null
	ssh -A -i ~/.ssh/$KEY_NAME $HOST_NAME "docker start $CONTAINER_NAME" &> /dev/null
	echo -e "\nReloading Apache Server..."
	ssh -A -i ~/.ssh/$KEY_NAME $HOST_NAME "systemctl reload apache2"
	echo -e "\nServer is now healthy."
}

is_healthy=`ssh -A -i ~/.ssh/$KEY_NAME $HOST_NAME "systemctl status apache2 | grep AH00111 &> /dev/null; echo $?"`
if [[ `echo $is_healthy` == 0 ]]; then
	echo -e "\nHealth Check FAILED..."
	health_check
else
	echo -e "\nHealth Check PASSED..."
fi

echo -e "\nDONE !!!"
