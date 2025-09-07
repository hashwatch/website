import axios from "axios";

const API_URL = "http://localhost:8000";
const API_KEY = "EXAMPLE_API_KEY";

// Получение списка устройств
export async function getDevices() {
  try {
    const url = `${API_URL}/devices?api_key=${API_KEY}`;
    const res = await axios.get(url);
    return res.data;
  } catch {
    return [];
  }
}

// Получение метрик конкретного майнера
export async function getMinerMetrics(tag: string) {
  try {
    const url = `${API_URL}/${tag}/metrics?api_key=${API_KEY}`;
    const res = await axios.get(url);
    return res.data;
  } catch {
    return { active: false, message: "error" };
  }
}

// Получение истории конкретного параметра майнера
export async function getMinerHistory(
  tag: string,
  param: string,
  last_hours = 24,
  points = 500
) {
  try {
    const url = `${API_URL}/${tag}/history?api_key=${API_KEY}&param=${param}&last_hours=${last_hours}&points=${points}`;
    const res = await axios.get(url);
    return res.data;
  } catch {
    return { data: [], message: "error" };
  }
}
