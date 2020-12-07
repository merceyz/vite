import fs from 'fs'
import path from 'path'
import { ServerOptions as HttpsServerOptions } from 'https'

export function resolveHttpsConfig(httpsOption: HttpsServerOptions) {
  const { ca, cert, key, pfx } = httpsOption
  Object.assign(httpsOption, {
    ca: readFileIfExists(ca),
    cert: readFileIfExists(cert),
    key: readFileIfExists(key),
    pfx: readFileIfExists(pfx)
  })
  if (!httpsOption.key || !httpsOption.cert) {
    httpsOption.cert = httpsOption.key = createCertificate()
  }
  return httpsOption
}

function readFileIfExists(value?: string | Buffer | any[]) {
  if (typeof value === 'string') {
    try {
      return fs.readFileSync(path.resolve(value as string))
    } catch (e) {
      return value
    }
  }
  return value
}

/**
 * https://github.com/webpack/webpack-dev-server/blob/master/lib/utils/createCertificate.js
 *
 * Copyright JS Foundation and other contributors
 * This source code is licensed under the MIT license found in the
 * LICENSE file at
 * https://github.com/webpack/webpack-dev-server/blob/master/LICENSE
 */
function createCertificate() {
  const pems = require('selfsigned').generate(null, {
    algorithm: 'sha256',
    days: 30,
    keySize: 2048,
    extensions: [
      // {
      //   name: 'basicConstraints',
      //   cA: true,
      // },
      {
        name: 'keyUsage',
        keyCertSign: true,
        digitalSignature: true,
        nonRepudiation: true,
        keyEncipherment: true,
        dataEncipherment: true
      },
      {
        name: 'extKeyUsage',
        serverAuth: true,
        clientAuth: true,
        codeSigning: true,
        timeStamping: true
      },
      {
        name: 'subjectAltName',
        altNames: [
          {
            // type 2 is DNS
            type: 2,
            value: 'localhost'
          },
          {
            type: 2,
            value: 'localhost.localdomain'
          },
          {
            type: 2,
            value: 'lvh.me'
          },
          {
            type: 2,
            value: '*.lvh.me'
          },
          {
            type: 2,
            value: '[::1]'
          },
          {
            // type 7 is IP
            type: 7,
            ip: '127.0.0.1'
          },
          {
            type: 7,
            ip: 'fe80::1'
          }
        ]
      }
    ]
  })
  return pems.private + pems.cert
}