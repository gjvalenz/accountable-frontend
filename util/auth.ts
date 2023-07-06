import context from '@/app/context'

const backend_request = (uri: string) => `https://localhost:7126/api${uri}`

export async function auth_get(uri: string)
{
    const token = context()
    if(!token)
        return Promise.reject();
    return fetch(backend_request(uri), {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-type': 'application/json; charset=UTF-8',
        }
    })
}

export async function auth_post(uri: string, data: object)
{
    const token = context()
    console.log(token)
    if(!token)
        return Promise.reject();
    return fetch(backend_request(uri), {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-type': 'application/json; charset=UTF-8',
        }
    })
}

export async function auth_post_form(uri: string, data: any)
{
    const token = context()
    console.log(token)
    if(!token)
        return Promise.reject();
    return fetch(backend_request(uri), {
        method: 'POST',
        body: data,
        headers: {
            'Authorization': 'Bearer ' + token,
        }
    })
}

export async function plain_get(uri: string)
{
    return fetch(backend_request(uri))
}

export async function plain_post(uri: string, data: object)
{
    return fetch(backend_request(uri), {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        }
    })
}

export async function plain_post_form(uri: string, data: any)
{
    return fetch(backend_request(uri), {
        method: 'POST',
        body: data,
    })
}