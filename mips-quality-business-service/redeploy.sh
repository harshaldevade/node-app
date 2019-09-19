name=mips-quality-business-service;
# Remove docker container
sudo docker stop $name;
sudo docker rm $name;

# Remove docker image
sudo docker rmi $name;

#Build docker image and run it
sudo docker build -t $name .;
sudo docker run -d -it -p 8002:8002 --name $name --restart always $name;
id=$(docker ps -qf "name=$name");
echo "Docker container ($id) is up and running...";
exit;
