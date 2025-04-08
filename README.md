# MelodyMatch
play song snippets to guess songs by your favourite artists (like our queen taylor swift)!

<img width="1288" alt="Screenshot 2025-04-07 at 11 21 22 PM" src="https://github.com/user-attachments/assets/07ef0cc6-94fd-4910-bd0f-b2b55a4c8505" />
<img width="1055" alt="Screenshot 2025-04-07 at 11 22 59 PM" src="https://github.com/user-attachments/assets/aaedc215-8d2f-4d68-ad41-76f790fd2b76" />
<img width="1234" alt="Screenshot 2025-04-07 at 11 23 47 PM" src="https://github.com/user-attachments/assets/8785edf2-a95d-408c-9a34-570d7b0c16f4" />
<img width="1240" alt="Screenshot 2025-04-07 at 11 24 41 PM" src="https://github.com/user-attachments/assets/79d9b018-9033-4943-a702-a18732b7f33c" />

<br> Uses React, Vite, Mantine for frontend <br>
Uses Express.js, MongoDB Atlas and Redis for sessions <br>
Uses Spotiy API for song snippets and OAuth flow <br>
Deployed via Ubuntu AWS EC2 instance, ECR for docker image management, Nginx with reverse proxy, configured SSL with Cloudflare<br>

TODO: <br>
convert all css files to css modules <br>
store login state in redis session store <br>
cache static json files in memory to reduce fs.sync calls <br>

read article later: https://medium.com/@prabhupj/hosting-multiple-websites-in-a-single-aws-ec2-instance-using-nginx-docker-containers-a95655b32592

