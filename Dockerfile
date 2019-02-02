FROM node:11-alpine
RUN npm install -g @cloudant/couchbackup
RUN npm install -g couchdocs 
CMD ["couchdocs"]

