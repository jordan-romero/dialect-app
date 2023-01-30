/* eslint-disable import/no-anonymous-default-export */
import axios from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'


const getRequestParams = (email: any) => {
  // get env variables
  const API_KEY = process.env.MAILCHIMP_API_KEY;
  const LIST_ID = process.env.MAILCHIMP_AUDIENCE_ID;
  // mailchimp datacenter - mailchimp api keys always look like this:
  // fe4f064432e4684878063s83121e4971-us6
  // We need the us6 part
  const DATACENTER = 'us-21';

  const url = `https://${DATACENTER}.api.mailchimp.com/3.0/lists/${LIST_ID}/members`;

  // Add aditional params here. See full list of available params:
  // https://mailchimp.com/developer/reference/lists/list-members/
  const data = {
    email_address: email,
    status: "subscribed",
  };

  // Api key needs to be encoded in base 64 format
  const base64ApiKey = Buffer.from(`anystring:${API_KEY}`).toString("base64");
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Basic ${base64ApiKey}`,
  };

  return {
    url,
    data,
    headers,
  };
}

export default async (req: NextApiRequest , res: NextApiResponse) => {
  const { email } = req.body;

  if (!email || !email.length) {
    return res.status(400).json({
      error: "Forgot to add your email?",
    });
  }

  try {
    const { url, data, headers } = getRequestParams(email);

    const response = await axios.post(url, data, { headers });
    console.log(response)

    // Success
    return res.status(201).json({ error: null });
  } catch (error: any) {
    return res.status(400).json({
      error: `Oops, something went wrong... Send me an email at uriklar@gmail.com and I'll add you to the list.`,
    });

    // Report error to Sentry or whatever
  }
};