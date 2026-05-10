import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase, Database } from "firebase/database";

const configs = [
  {
    apiKey: "AIzaSyDKQHw-PctW8FMVQ84GikQxJiiz1F3jC8I",
    authDomain: "project-a-ff1a9.firebaseapp.com",
    projectId: "project-a-ff1a9",
    storageBucket: "project-a-ff1a9.firebasestorage.app",
    messagingSenderId: "170306993255",
    appId: "1:170306993255:web:79849fecee1e397b2da8c2",
    measurementId: "G-ZTDLGW9JJ4",
    databaseURL: "https://project-a-ff1a9-default-rtdb.asia-southeast1.firebasedatabase.app"
  }
];

export interface FirebaseInstance {
  app: FirebaseApp;
  auth: Auth;
  db: Database;
  index: number;
}

const instances: FirebaseInstance[] = configs.map((config, index) => {
  const appName = `project-${String.fromCharCode(97 + index)}`;
  const app = getApps().find(a => a.name === appName) || initializeApp(config, appName);
  return {
    app,
    auth: getAuth(app),
    db: getDatabase(app),
    index
  };
});

export const googleProvider = new GoogleAuthProvider();

export const getFirebase = (index: number) => instances[0]; // Always return first for simplicity
export const allInstances = [instances[0]];

// Default instance for shared data like configs/sponsors if needed
export const mainProject = instances[0];
export const blogProject = instances[0];
export const verificationProject = instances[0];
export const reportProject = instances[0];
