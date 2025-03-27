import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// --- Configuration ---

// IMPORTANT: Replace with your actual backend URL
// Android Emulator typically uses 10.0.2.2 to reach host machine's localhost
// iOS Simulator can use localhost directly
// Physical device needs your machine's local network IP (e.g., 192.168.1.100)
const BASE_URL = Platform.OS === 'android'
    ? 'http://192.168.134.240:5000/api/v1' // Default for Android Emulator
    : 'http://localhost:5000/api/v1'; // Default for iOS Simulator / Web

// Key for storing the auth token in AsyncStorage
const AUTH_TOKEN_KEY = 'userAuthToken';

// --- Helper Functions ---

/**
 * Retrieves the authentication token from AsyncStorage.
 * @returns {Promise<string|null>} The token or null if not found.
 */
const getAuthToken = async () => {
    try {
        // return 'demo-token-user-1'; // Use this for initial testing with placeholder auth
        const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        return token;
    } catch (e) {
        console.error('Failed to fetch auth token from storage', e);
        return null;
    }
};

/**
 * Stores the authentication token in AsyncStorage.
 * @param {string} token The token to store.
 * @returns {Promise<void>}
 */
const storeAuthToken = async (token) => {
    try {
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    } catch (e) {
        console.error('Failed to save auth token to storage', e);
    }
};

/**
 * Removes the authentication token from AsyncStorage.
 * @returns {Promise<void>}
 */
const removeAuthToken = async () => {
    try {
        await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    } catch (e) {
        console.error('Failed to remove auth token from storage', e);
    }
};


/**
 * Generic request handler.
 * @param {string} endpoint - The API endpoint (e.g., '/users/me').
 * @param {string} [method='GET'] - HTTP method.
 * @param {object|null} [body=null] - Request body for POST/PUT.
 * @param {boolean} [isAuthenticated=true] - Whether to include the Auth header.
 * @param {boolean} [isFormData=false] - Whether the body is FormData.
 * @returns {Promise<any>} - The JSON response body.
 * @throws {Error} - Throws an error on network issues or non-OK responses.
 */
const request = async (endpoint, method = 'GET', body = null, isAuthenticated = true, isFormData = false) => {
    const url = `${BASE_URL}${endpoint}`;
    const headers = new Headers();

    if (!isFormData) {
         headers.append('Content-Type', 'application/json');
    }
    headers.append('Accept', 'application/json');


    if (isAuthenticated) {
        const token = await getAuthToken();
        if (token) {
            headers.append('Authorization', `Bearer ${token}`);
        } else {
            // Handle cases where auth is required but token is missing
            // Optionally, could redirect to login or throw specific auth error
            console.warn(`Attempted authenticated request to ${endpoint} without token.`);
            // Depending on backend, request might fail anyway, or you can throw here:
            // throw new Error('Authentication token is missing.');
        }
    }

    const config = {
        method: method,
        headers: headers,
    };

    if (body) {
        config.body = isFormData ? body : JSON.stringify(body);
    }

    try {
        const response = await fetch(url, config);

        // Handle No Content response
        if (response.status === 204) {
            return null; // Or {}, depending on how you want to handle it
        }

        const responseBody = await response.json();

        if (!response.ok) {
            // Use error message from backend response if available
            const errorMessage = responseBody?.message || responseBody?.description || `HTTP error ${response.status}`;
            const error = new Error(errorMessage);
            error.status = response.status;
            error.body = responseBody; // Attach full body for potential details
            throw error;
        }

        return responseBody;

    } catch (error) {
        console.error(`API request failed: ${method} ${endpoint}`, error);
        // Re-throw the error so calling code can handle it (e.g., show user message)
        throw error;
    }
};

// --- API Endpoint Functions ---

// 1. Authentication
export const register = (userData) => request('/auth/register', 'POST', userData, false); // No auth needed
export const login = (credentials) => request('/auth/login', 'POST', credentials, false); // No auth needed
// Note: We'll call storeAuthToken after successful login/register in the UI logic

// Utility to be called on logout
export const logout = removeAuthToken;


// 2. Users
export const getCurrentUser = () => request('/users/me', 'GET');
export const updateCurrentUser = (userData) => request('/users/me', 'PUT', userData);

// 3. Farms
export const createFarm = (farmData) => request('/farms', 'POST', farmData);
export const listFarms = (limit = 20, offset = 0) => request(`/farms?limit=${limit}&offset=${offset}`, 'GET');
export const getFarm = (farmId) => request(`/farms/${farmId}`, 'GET');
export const updateFarm = (farmId, farmData) => request(`/farms/${farmId}`, 'PUT', farmData);
export const deleteFarm = (farmId) => request(`/farms/${farmId}`, 'DELETE');

// 4. Lands
export const createLand = (farmId, landData) => request(`/farms/${farmId}/lands`, 'POST', landData);
export const listLands = (farmId, limit = 50, offset = 0) => request(`/farms/${farmId}/lands?limit=${limit}&offset=${offset}`, 'GET');
export const getLand = (landId) => request(`/lands/${landId}`, 'GET');
export const updateLand = (landId, landData) => request(`/lands/${landId}`, 'PUT', landData);
export const deleteLand = (landId) => request(`/lands/${landId}`, 'DELETE');

// 5. Hardware Devices
export const registerHardwareDevice = (deviceData) => request('/hardware_devices', 'POST', deviceData);
export const listFarmHardwareDevices = (farmId, status = null) => {
    let endpoint = `/farms/${farmId}/hardware_devices`;
    if (status) {
        endpoint += `?status=${status}`;
    }
    return request(endpoint, 'GET');
};
export const getHardwareDevice = (deviceId) => request(`/hardware_devices/${deviceId}`, 'GET');
export const updateHardwareDevice = (deviceId, deviceData) => request(`/hardware_devices/${deviceId}`, 'PUT', deviceData);
export const updateDeviceAssignment = (deviceId, assignmentData) => request(`/hardware_devices/${deviceId}/assignment`, 'PUT', assignmentData);
export const deleteHardwareDevice = (deviceId) => request(`/hardware_devices/${deviceId}`, 'DELETE');

// 6. Soil Readings
export const getSoilReadings = (landId, params = {}) => {
    // params could be { start_date, end_date, parameters: 'ph,moisture', limit, offset }
    const query = new URLSearchParams(params).toString();
    return request(`/lands/${landId}/soil-readings?${query}`, 'GET');
};
// Note: Ingest endpoint is called by the device, not the mobile app.

// 7. Plantings
export const startPlanting = (landId, plantingData) => request(`/lands/${landId}/plantings`, 'POST', plantingData);
export const getPlanting = (plantingId) => request(`/plantings/${plantingId}`, 'GET');
export const updatePlanting = (plantingId, plantingData) => request(`/plantings/${plantingId}`, 'PUT', plantingData);
// Optional: export const getPlantingHistory = (landId) => request(`/lands/${landId}/plantings/history`, 'GET');

// 8. Diagnostics
/**
 * Uploads a plant image for disease analysis.
 * @param {object} imageData - Object containing { uri: string, name: string, type: string } for the image.
 * @param {number|null} [landId] - Optional associated land ID.
 * @param {number|null} [plantingId] - Optional associated planting ID.
 * @returns {Promise<any>} - The initial response (log_id, status).
 */
export const scanPlantDisease = (imageData, landId = null, plantingId = null) => {
    const formData = new FormData();
    formData.append('image', {
        uri: imageData.uri,
        name: imageData.name,
        type: imageData.type,
    });
    if (landId !== null) {
        formData.append('land_id', landId.toString());
    }
    if (plantingId !== null) {
        formData.append('planting_id', plantingId.toString());
    }
    // Use the generic request helper, specifying isFormData=true
    return request('/diagnostics/scan-plant', 'POST', formData, true, true);
};
export const getDiagnosisLog = (logId) => request(`/diagnostics/logs/${logId}`, 'GET');
export const listDiagnosisLogs = (params = {}) => {
     // params could be { limit, offset, land_id }
    const query = new URLSearchParams(params).toString();
    return request(`/diagnostics/logs?${query}`, 'GET');
};

// 9. Recommendations
export const getCropSuggestions = (landId) => request(`/lands/${landId}/crop-suggestions`, 'GET');
export const getFertilizerRecommendations = (landId) => request(`/lands/${landId}/fertilizer-recommendations`, 'GET');
export const getRecommendations = (params = {}) => {
     // params could be { type: 'weekly_tip', is_read: false, limit, offset, farm_id, land_id }
    const query = new URLSearchParams(params).toString();
    return request(`/recommendations?${query}`, 'GET');
};
export const updateRecommendationStatus = (recommendationId, statusData) => request(`/recommendations/${recommendationId}/status`, 'PUT', statusData);

// 10. Reference Data
export const listCrops = () => request('/crops', 'GET', null, false); // Assuming public or auth optional
export const listDiseases = () => request('/diseases', 'GET', null, false); // Assuming public or auth optional
export const listFertilizers = () => request('/fertilizers', 'GET', null, false); // Assuming public or auth optional

export const saveManualSoilReading = (landId, readingData) => {
    // Add a timestamp client-side before sending
    const dataWithTimestamp = {
        ...readingData,
        timestamp: new Date().toISOString(),
    };
    // Assuming a new dedicated endpoint for clarity
    return request(`/lands/${landId}/manual-soil-reading`, 'POST', dataWithTimestamp, true);
    // Alternative (if modifying ingest):
    // return request(`/ingest/soil-readings`, 'POST', { ...dataWithTimestamp, land_id: landId }, true); // Use user auth
};

// --- Export Auth Helpers ---
// Export storage functions so UI can call them directly on login/logout flows
export { storeAuthToken, removeAuthToken as clearAuthToken, getAuthToken };