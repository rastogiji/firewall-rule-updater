FROM node:alpine
COPY index.js package.json /
RUN npm install
CMD ["npm", "start"]

