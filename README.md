# ConfrenceBox
Here I am trying to create a Confrence mangement Backend Service where users can join the available confrences created by the admin. They can vote other people to be a speaker of the confrence and people can ask admin  run campaign on there behalf to be a speaker of the particuar confrence.  

Here are some assumptions that i have made for this Project :- 
1. There will we only one speaker for a confrence that will we decided by admin on the basis of votes.
2. The maximum user on the platform would be 10000


Technologies Used-


1. Nodejs- As this project is request extensive and we donot have to perform heavy mathmatical processing things , be should use nodejs to develop the server and the api's as node is very fast in handling I/O requests.
2. Express JS- For creating server we will be using Express as it provides very easy and Efficient way of creating the server. Route manegement is also very easy with Express and as well as middleware magement
3. MySql - Since the data schema requeired by this project is very fixed in nature , i would go with reational databases here , and since we donot have to perform or store any complex object or json structure here i will got with mysql databses in relational databases
4. Pm2 - Forcusturing and demon mangemanet to utilise full power of the multicore cpu's available i will use pm2 on the server for running up the instances of my server process. With the help of pm2 we can also store the logs about the process crash or process performance
5- Ngnix - For load-balancing and reverse-proxy (reverse-proxy to blacklist and white-list ip's and secure the process by hinding the port they are running on) we will be using Ngnix



Steps to initialize the project

1. Take a pull of the repo.
2. Create an .env file and paste the conent of .env.example and add your credentials to it.
3. run command ->npm install
4.  run command-> sequelize db:migrate
5. run command-> sequelize db:seed:all
6. node server.js
7. Change the baseUrl in swagger.json file
8. For accessing the api's visit route -- {{baseUrl}}/api-docs

And Your server will we running on the port you have provided


Databse Structure Diagram - ER-Diagram.png
System Design  Diagram -



Commit 1---
Added migrations for db Schema and Seeder for roles table
