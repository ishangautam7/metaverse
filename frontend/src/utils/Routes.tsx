export const host =
  process.env.MODE === "prod"
    ? "https://metaverse-kz5d.onrender.com"
    : typeof window !== "undefined" && window.location.hostname.startsWith("192.168.")
      ? "http://192.168.1.15:4000"
      : "http://localhost:4000";

export const loginRoute = `${host}/api/auth/user/login`
export const registerRoute = `${host}/api/auth/user/register`
export const validateToken = `${host}/api/auth/user/validate-token`

export const mapcreateroute = `${host}/api/space`
export const fetchmaproute = `${host}/api/space/fetch`
export const findMapByUIdRoute = `${host}/api/space/fetch`
export const getsinglemapdetailsroute = `${host}/api/space/singlemap`
export const checkmaproute = `${host}/api/space/checkmap`