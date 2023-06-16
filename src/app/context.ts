export default function(): string | null
{
    if(typeof window !== "undefined") {
        return localStorage.getItem('token')
    }
    return null
}
