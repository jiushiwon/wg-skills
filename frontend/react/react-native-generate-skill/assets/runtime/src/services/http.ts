import axios from 'axios';
import {appConfig} from '../config';
export const http = axios.create({baseURL: appConfig.baseURL, timeout: 15000});
