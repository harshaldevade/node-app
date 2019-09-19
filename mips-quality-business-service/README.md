# MIPS Quality Business Service

<p><b>MIPS Quality Business Service</b> serves you as GraphQL Business Service Layer. Service is depend on MIPS Data Service Layer.</p>

## Deployment Steps

You can also find <b>deploy.sh</b> and <b>redeploy.sh</b> shell script for deployment which includes following lines.

<ul>
    <li>
        Execute deployment script by typing following command on Linux terminal
        <br/>
        sudo bash deploy.sh
    </li>
    <li>
        Execute deployment script to redeploy by typing following command on Linux terminal
        <br/>
        sudo bash redeploy.sh
    </li>
</ul>
<ol><h4>Docker Deployment:</h4>
    <li>Build Docker Image<br/>sudo docker build -t mips-quality-business-service.</li>
    <li>Run Docker Image<br/> sudo docker run -d -it -p 8002:8002 --name mips-quality-business-service --restart always mips-quality-business-service</li>
    <li><b>Verify docker container is running</b><br/> sudo docker ps</li>
</ol>

<br/>

<ol><h4>Docker Re-deployment:</h4>
    <li>Stop Docker Container<br/>sudo docker stop mips-quality-business-service</li>
    <li>Remove Docker Container<br/>sudo docker rm mips-quality-business-service</li>
    <li>Remove Docker Image<br/>sudo docker rmi mips-quality-business-service</li>
    <li>Build Docker Image<br/>sudo docker build -t mips-quality-business-service.</li>
    <li>Run Docker Image<br/> sudo docker run -d -it -p 8002:8002 --name mips-quality-business-service --restart always mips-quality-business-service</li>
    <li><b>Verify docker container is running</b><br/> sudo docker ps</li>
</ol>

## Deployed Service Urls

<ul>
    <h5>Development Environment</h5>
    <li><b>Service Endpoint: </b>http://35.232.53.80:8001/mips-quality</li>
    <li><b>Service Playground: </b>http://35.232.53.80:8002/playground</li>
</ul>

## Authors
- **Ravindra Wagh** - _Initial work_ - ravindraw@figmd.com

## License
This project is licensed under the FIGmd Inc.