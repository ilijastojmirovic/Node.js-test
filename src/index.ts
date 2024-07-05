import express from 'express';
import axios from 'axios';
import NodeCache from 'node-cache';

const app = express();
const port = 8080;
const cache = new NodeCache({ stdTTL: 3600 });


app.get('/api/files', async (req, res) => {
    
  const cachedData = cache.get('filesData');
  if (cachedData) {
      res.json(cachedData);
  } else {
      res.status(202).send('Processing data, please try again shortly');
  }

    try {
       
        const response = await axios.get('https://rest-test-eight.vercel.app/api/test');
        const data = response.data.items;

        const transformedData: any = {};

        data.forEach((item: any) => {
            const fileUrl = item.fileUrl.replace(/\/$/, '');
            const urlParts = fileUrl.split('/');
            const ip_adress = urlParts[2].split(':')[0];
            const directoryName = urlParts[3];
            const restOfUrl = urlParts.slice(4);

            if (!transformedData[ip_adress]) {
                transformedData[ip_adress] = [];
            }

            let dirObj = transformedData[ip_adress].find((dir: any) => dir[directoryName]);
            if (!dirObj) {
                dirObj = { [directoryName]: [] };
                transformedData[ip_adress].push(dirObj);
            }

            let currentLevel = dirObj[directoryName];

            restOfUrl.forEach((urlPart: string, index: number) => {
                if (index === restOfUrl.length - 1) {
                  if (!Array.isArray(currentLevel)) {
                    currentLevel = [];
                }
                    currentLevel.push(urlPart);
                } else {
                  if (!Array.isArray(currentLevel)) {
                    currentLevel = [];
                }
                    let subDirObj = currentLevel.find((subDir: any) => subDir[urlPart]);
                    if (!subDirObj) {
                        subDirObj = { [urlPart]: [] };
                        currentLevel.push(subDirObj);
                    }
                    currentLevel = subDirObj[urlPart];
                }
            });
        });

        cache.set('filesData', transformedData);
        //res.json(transformedData);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Error fetching data');
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
