const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

// Verify webhook setup
app.get('/webhook', (req, res) => {
    
    const tokenToBeVerified = process.env.VERIFY_TOKEN;
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token === tokenToBeVerified) {
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

// Handle incoming events
app.post('/webhook', (req, res) => {
    const event = req.body;

    if (event && event.entry) {
        const userId = event.entry[0].messaging[0].sender.id;
        let adId = event.entry[0].messaging[0].ad_id;

        console.log('ADD ID: ' + adId);

        // Remove this when ap is live
        if ( adId == undefined ) {
            adId = '120212943911610130';
        }

        const accessToken = process.env.PAGE_ACCESS_TOKEN;
        const serverWebhook = process.env.WEBHOOK_URL;

        // Step 1: Fetch user data
        axios.get(`https://graph.facebook.com/v20.0/${userId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
            params: {
                fields: 'first_name,last_name,birthday,location,hometown'
            }
        })
        .then((userResponse) => {
            const userData = userResponse.data;
            //console.log('User Data:', userData);

            // Step 2: Fetch ad data
            return axios.get(`https://graph.facebook.com/v20.0/${adId}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
                params: {
                    fields: 'name,adset_id,campaign_id'
                }
            })
            .then(adResponse => {
                const adData = adResponse.data;
                //console.log('Ad Data:', adData);

                // Step 3: Fetch adset and campaign data
                return Promise.all([
                    axios.get(`https://graph.facebook.com/v20.0/${adData.adset_id}`, {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        },
                        params: {
                            fields: 'id,name'
                        }
                    }),
                    axios.get(`https://graph.facebook.com/v20.0/${adData.campaign_id}`, {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        },
                        params: {
                            fields: 'id,name'
                        }
                    })
                ])
                .then(([adsetResponse, campaignResponse]) => {
                    // Construct the final object
                    const finalData = {
                        user: {
                            first_name: userData.first_name,
                            last_name: userData.last_name,
                            birthday: userData.birthday ? userData.birthday : null,
                            location: userData.location ? userData.location : null,
                            hometown: userData.hometown ? userData.hometown : null
                        },
                        ad: {
                            name: adData.name,
                            ad_set: adsetResponse.data.name,
                            campaign: campaignResponse.data.name
                        }
                    };

                    console.log('Final Data:', finalData);

                    // Step 4: Send the data to your webhook
                    try {

                        return axios.post(serverWebhook, finalData);
                        //res.status(200).send(finalData);

                    } catch (webhookError) {

                        console.log(error);
                        res.status(400).send('Issue Occurred from server webhook');
                    }
                });
            });
        })
        .then(response => {
            console.log('Data sent to the webhook:', response.data);
            res.status(200).send('Data processed successfully');
        })
        .catch(error => {
            console.error('Error occurred:', error.response ? error.response.data : error.message);
            res.status(500).send('Error occurred while processing the event');
        });
    } else {
        res.sendStatus(400);
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});