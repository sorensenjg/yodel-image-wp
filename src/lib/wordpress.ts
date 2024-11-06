import axios from "axios";

const { config } = window.yodelImageAdmin;

// https://developer.wordpress.org/rest-api/reference/media/
export async function getImages() {
  const url = config.restUrl + "/media?media_type=image&_embed=author";
  const response = await axios.get(url);

  return response.data;
}

export async function updateImage(id: number, data: any) {
  const url = config.restUrl + `/media/${id}`;

  const formData = new FormData();
  Object.keys(data).forEach((key) => formData.append(key, data[key]));

  const response = await axios.post(url, data, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-WP-Nonce": config.restNonce,
    },
    withCredentials: true,
  });

  return response.data;
}

export async function createMetadataPrediction(imageId: number) {
  const { ajaxUrl, ajaxNonce } = config;

  const formData = new FormData();
  formData.append("action", "yodel_image_create_metadata_prediction");
  formData.append("nonce", ajaxNonce);
  formData.append("image_id", imageId.toString());

  try {
    const response = await axios.post(ajaxUrl, formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cache-Control": "no-cache",
      },
      withCredentials: true,
    });

    if (response.status !== 200) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    return response.data;
  } catch (error) {
    console.error("Error processing images:", error);
    throw error;
  }
}

export async function getMetadataPrediction(predictionId: string) {
  const { ajaxUrl, ajaxNonce } = config;

  const formData = new FormData();
  formData.append("action", "yodel_image_get_metadata_prediction");
  formData.append("nonce", ajaxNonce);
  formData.append("prediction_id", predictionId);

  try {
    const response = await axios.post(ajaxUrl, formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cache-Control": "no-cache",
      },
      withCredentials: true,
    });

    if (response.status !== 200) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    return response.data;
  } catch (error) {
    console.error("Error processing images:", error);
    throw error;
  }
}

export async function pollMetadataPrediction(
  predictionId: string,
  interval = 2000,
  maxRetries = 10
) {
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const response = await getMetadataPrediction(predictionId);

      if (response.data.status === "failed") {
        return response;
      }

      if (response.data.status === "succeeded") {
        return response;
      }

      // Optionally, handle other statuses or progress indicators here
      console.log(`Attempt ${retries + 1}: Status - ${response.data.status}`);
    } catch (error) {
      console.error(`Error polling metadata prediction: ${error}`);
      throw error;
    }

    retries += 1;

    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error(
    "Polling metadata prediction timed out after maximum retries."
  );
}
