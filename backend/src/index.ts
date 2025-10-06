import { Hono } from 'hono'
import fs from 'fs'
import path from 'path'
import { serve } from 'bun'
import crypto, { randomUUID } from 'crypto'
import jwtLib from 'jsonwebtoken'
import type { Context } from 'hono'
import { cors } from 'hono/cors'

import {
  deleteCookie,
  getCookie,
  getSignedCookie,
  setCookie,
  setSignedCookie,
  generateCookie,
  generateSignedCookie,
} from 'hono/cookie'
import { logger } from 'hono/logger'
import { notDeepStrictEqual } from 'assert'

const app = new Hono()

app.use('*', cors({
  origin: '*',
  credentials: true,
}))

app.use(logger())

// use client private key to sign jwts sent to wxO
const CLIENT_PRIVATE_KEY = fs.readFileSync(path.join(__dirname, '../keys/example-jwtRS256.key'))

// use client public key shared with wxO to verify JWTs originate from our app
const CLIENT_PUBLIC_KEY = fs.readFileSync(path.join(__dirname, '../keys/example-jwtRS256.key.pub'))

// use ibm public key to encrypt user_payload
const IBM_PUBLIC_KEY = fs.readFileSync(path.join(__dirname, '../keys/ibmPublic.key.pub'))
// test key.pem


// A time period of 45 days in milliseconds.
const TIME_45_DAYS = 1000 * 60 * 60 * 24 * 45;

type UserPayload = {
  custom_message: string,
  name: string,
  custom_user_id?: string
}

type jwtContentType = {
  sub: string,
  user_payload: UserPayload | string,
  context: string
}

type SessionInfo = {
  userName?: string,
  customUserID?: string
} | null | undefined

async function createJWTString(annoymousUserID: string, sessionInfo: SessionInfo, context: string) {

  const jwtContent: jwtContentType = {
    sub: "518234934",
    user_payload: '',
    context
  };

  // Build a fresh userPayload object so we never mutate a string union
  const userPayloadObject: UserPayload = {
    custom_message: 'Encrypted message',
    name: 'Annonymous'
  }

  if (sessionInfo) {
    userPayloadObject.name = sessionInfo.userName!;
    userPayloadObject.custom_user_id = sessionInfo.customUserID!;
  }

  // if (jwtContent.user_payload) {
  //   const rsaKey = new NodeRSA(IBM_PUBLIC_KEY);
  //   const dataString = JSON.stringify(jwtContent.user_payload);
  //   const utf8Data = Buffer.from(dataString, "utf-8");
  //   jwtContent.user_payload = rsaKey.encrypt(utf8Data, "base64");
  // }

  const dataString = JSON.stringify(userPayloadObject);

  // Encrypted data
  const encryptedBuffer = crypto.publicEncrypt(
    {
      key: IBM_PUBLIC_KEY,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    },
    Buffer.from(dataString)
  );

  jwtContent.user_payload = encryptedBuffer.toString('base64');

  const jwtString = jwtLib.sign(jwtContent, CLIENT_PRIVATE_KEY, {
    algorithm: 'RS256',
    expiresIn: '1000000s'
  })

  return jwtString;
}


function getOrSetAnnonymousUserID(c: Context) {
  let annoymousID = getCookie(c, 'ANONYMOUS-USER-ID');
  if (!annoymousID) {
    annoymousID = `anon-${randomUUID().substring(0, 5)}`;
  }

  setCookie(c, 'ANONYMOUS-USER-ID', annoymousID, {
    expires: new Date(Date.now() + TIME_45_DAYS),
    httpOnly: true,
  })

  return annoymousID;

}

function getSessionInfo(c: Context) {
  const sessionInfo = getCookie(c, 'SESSION_INFO');
  if (sessionInfo) {
    return JSON.parse(sessionInfo) as SessionInfo;
  }

  return null;
}


app.get('/createJWT', async (c: Context) => {
  const annonymousUserID = getOrSetAnnonymousUserID(c);
  const sessionInfo = getSessionInfo(c);

  const context = {
    dev_id: 23424,
    dev_name: 'kemkai',
    is_active: true
  }

  const jwtString = await createJWTString(annonymousUserID, sessionInfo, JSON.stringify(context));
  return c.text(jwtString);

})

serve({
  fetch: app.fetch,
  port: 3001
})

