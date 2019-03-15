
export const buildQuery = (requestParams) => {
  requestParams = requestParams || {}
  let keys = Object.keys(requestParams)
  requestParams['random'] = Date.now()

  const sortParams = {}
  keys = Object.keys(requestParams)
  keys.sort().forEach(k => {
    sortParams[k] = requestParams[k]
  })

  return Object.assign({}, requestParams, {
    appid: '',
    appsecret: '',
  })
}
