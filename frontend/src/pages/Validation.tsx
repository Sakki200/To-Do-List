import { useNavigate } from "react-router-dom";
import apiClient from "../scripts/axio";
import cookie from "js-cookie";

export default function Validation() {
  const navigate = useNavigate();

  async function isConnected() {
    try {
      const response = await apiClient.get("auth/");
      if (response.data && response.data.token) {
        navigate("/lists");
      }
    } catch (error) {
      // Not connected
    }
  }

  async function validation() {
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get("id");
    try {
      const response = await apiClient.get("auth/validation/" + id);
      console.log(response);

      if (response.data.token) {
        cookie.set("token", response.data.token, { path: "/" });
        navigate("/lists");
      }
    } catch (error: any) {}
  }

  isConnected();
  validation();

  return <div></div>;
}
