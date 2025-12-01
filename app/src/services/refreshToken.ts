export async function refreshAuthToken(){
    try{
        const res = await fetch(import.meta.env.VITE_API_URL + "/auth/refresh", {
            method: "POST",
            credentials: "include"
        });
        if (!res.ok) return null;

        const data = await res.json()
        const newToken = data.access_token;

        localStorage.setItem("token", newToken)

        return newToken
    }catch(err){
        console.error("Erro ao renovar token: ", err)
        return null
    }
}