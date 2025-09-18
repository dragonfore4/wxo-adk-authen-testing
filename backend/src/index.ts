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

const app = new Hono()

app.use('*', cors({
  origin: '*',
  credentials: true,
}))

app.use(logger())

// const PRIVATE_KEY = fs.readFileSync(path.join(__dirname, '../../adk/keys/client_private_key.pem')).toString()
// const PUBLIC_KEY = fs.readFileSync(path.join(__dirname, '../../adk/keys/example-jwtRS256.key.pub'),).toString()

const SHARED_SECRET = 'my_super_secret_key_which_is_very_long_and_secure';



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
    sub: annoymousUserID,
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

  const dataString = JSON.stringify(userPayloadObject);

  // Encrypted data

  const encryptedBuffer = crypto.publicEncrypt(
    {
      key: SHARED_SECRET,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    },
    Buffer.from(dataString)
  );

  jwtContent.user_payload = encryptedBuffer.toString('base64');

  const jwtString = jwtLib.sign(jwtContent, SHARED_SECRET, {
    algorithm: 'HS256', // algorithm HS256 เปลี่ยน private_key ด้วยเป็นอะไรสักอย่าง
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

app.get('/key', (c) => {
  return c.json({
    publicKey: PUBLIC_KEY,
    privateKey: PRIVATE_KEY
  })
})


app.get('/', async (c: Context) => {
  const annonymousUserID = getOrSetAnnonymousUserID(c);
  const sessionInfo = getSessionInfo(c);

  const context = {
    dev_id: 23424,
    dev_name: 'Name',
    is_active: true
  }

  const jwtString = await createJWTString(annonymousUserID, sessionInfo, JSON.stringify(context));
  return c.text(jwtString);

})

app.get("/decrypt", (c) => {

  const userPayload = "ZtKkJJcYZNMkoG3GYAvEXlhNnwj4xWFEMo2Ykk+pgwDI902O19B80B0K5/2TVdSLrYD87brg8SdbzRvrUlbqfRJZiaAe0XbiNNYOa8m0wY2hHnS66Xss/ItfSQ909W0588p4WKcj+xKH+BPGylHoNiha/uG93U9VV4RhAubmxnW4Vw98Tj6+nOvFvvtMKKpnbkXslYpY9bdUBZxzglhPeRG1Zw5Y3otZkV0LTKws6mEAetaXwJhlDjGfIXj/kUNO+i8gFj2s9NJ3oHDQW4Udy4+x/cRVBEPL3mrMwGQBTcDlrwZzlFcv0Yk/BubvyqifeEHBONulyykMyewV91BpfyvcB/Y6UU9IjLkwJaYPAq3ufKTZM/32Vxe/rfyDmkyPz4p6gtxV24JgKA7OMctXIUOUW7X1d5j3+CJ+BasaWuQikh+1mrGvcq2W1LTjUGrnDJ/rWuZfRUdDbCX/PLD4fYENFYPp1ocF7HZJNverTBTwq8tNe7PGqLXf1n98OScQo/O74bpcw2VbtULgzpkvRVcIUQwJ+4Tu9h4Z28pq7DQInsOy1FtjPDKLq1oiXMhNrorsiATP74hRt5yapD/mEItnDsurwLJQKcAuZtK6swpHSOLpG1+z6wDNf5emq6dIYSYaRLlzIhTcWtywvkuvz3yUrIOAmFPL48UISKaEZhA=";

  const encryptedBuffer = Buffer.from(userPayload, 'base64');

  const decryptedBuffer = crypto.privateDecrypt({
    key: PRIVATE_KEY,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: 'sha256'
  }, encryptedBuffer);

  const decryptedString = decryptedBuffer.toString('utf-8');

  return c.text(decryptedString);
})

serve({
  fetch: app.fetch,
  port: 3001
})

