import { useNavigate } from "react-router-dom";
import apiClient from "../scripts/axio";
import cookie from "js-cookie";

export default function Validation() {
  const navigate = useNavigate();

  async function isConnected() {
    try {
      const response = await apiClient.get("auth/");
      if (response.data && response.data.token) {
      }
    } catch (error) {
      navigate("/connection");
    }
  }

  async function validation() {
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get("id");
    try {
      await apiClient.post("collaboration/invitation/" + id);
      navigate("/lists");
    } catch (error: any) {
      navigate("/");
    }
  }

  isConnected();
  validation();

  return <></>;
}
