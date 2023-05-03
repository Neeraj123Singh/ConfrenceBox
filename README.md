# ConfrenceBox
Here I am trying to create a Confrence mangement Backend Service where users can join the available confrences created by the admin. They can vote other people to be a speaker of the confrence and people can ask admin  run campaign on there behalf to be a speaker of the particuar confrence.  

Here are some assumptions that i have made for this Project :- 
1. There will we only one speaker for a confrence that will we decided by admin on the basis of votes.
2. The maximum user on the platform would be 10000


Technologies Used-


1. Nodejs- As this project is request extensive and we donot have to perform heavy mathmatical processing things , be should use nodejs to develop the server and the api's as node is very fast in handling I/O requests.
2. Express JS- For creating server we will be using Express as it provides very easy and Efficient way of creating the server. Route manegement is also very easy with Express and as well as middleware magement
3. Postgres - Since the data schema requeired by this project is very fixed in nature , i would go with reational databases here ,  i will go with Postgres databses in relational databases
4. Pm2 - Forcusturing and demon mangemanet to utilise full power of the multicore cpu's available i will use pm2 on the server for running up the instances of my server process. With the help of pm2 we can also store the logs about the process crash or process performance
5- Ngnix - For load-balancing and reverse-proxy (reverse-proxy to blacklist and white-list ip's and secure the process by hinding the port they are running on) we will be using Ngnix
6- Joi - For request Validation we will use Joi Package of the npm
7- acl - We will use acl model to Authorize the routes( With Acl we can have as many roles as we can . Add provide each role the configuration of the api's that it can access)


Scope of the Project
1. User Authenctication and Authorization
2. Change Password via otp and Url on mail
3. Create Confrence and Register
4. Vote Other USers
5. Run Email Campaigns to generate Votes for a confrence


Steps to initialize the project

1. Take a pull of the repo.
2. Create an .env file and paste the conent of .env.example and add your credentials to it.
3. run command ->npm install
4.  run command-> sequelize db:migrate
5. run command-> sequelize db:seed:all
6. node server.js
7. Change the baseUrl in swagger.json file
8. For accessing the api's visit route -- {{baseUrl}}/v1/api-docs
9. change the connection configuraton for redis in job/index.js file 
10.node jobs/index.js -- run this command to run the job queue

And Your server will we running on the port you have provided


Databse Structure Diagram - ER-Diagram.png

System Design  Diagram - SystemArchitecture.png



Commit 1---
Added migrations for db Schema and Seeder for roles table

Commit -2 ---
Added User Auth and CHange Password flow

Commit 3---
Added Api's related to Confrence 

Commit 4 --- 
Added Api's related to Voting

Commit -- Added Schedular and Queue for Sending Campaigns
