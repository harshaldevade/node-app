name=service-desk;
id=$(docker ps -qf "name=$name");

# Remove Docker Container
sudo docker stop $id;
sudo docker rm $id;
# Remove Docker Image
imageId $(docker image ls $name -q);
sudo docker rmi $imageId;

#Build and Run Docker Image
sudo docker build -t $name .;
sudo docker run -d -it -p 7008:7008 --name $name --restart always $name;
echo 'Docker Started Succesfully...';
exit;
