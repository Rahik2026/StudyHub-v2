import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  getDocs,
  serverTimestamp,
  limit
} from "firebase/firestore";
import { db } from "./firebase";

// Generic Subscribe Hook
export const subscribeToCollection = (collectionName, constraints, callback) => {
  const q = query(collection(db, collectionName), ...constraints);
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  });
};

// Homework Actions
export const addHomework = (data) => addDoc(collection(db, "homework"), {
  ...data,
  createdAt: serverTimestamp(),
  status: 'pending'
});

export const updateHomework = (id, data) => updateDoc(doc(db, "homework", id), data);

export const deleteHomework = (id) => deleteDoc(doc(db, "homework", id));

// Exams Actions
export const addExam = (data) => addDoc(collection(db, "exams"), {
  ...data,
  createdAt: serverTimestamp()
});

export const deleteExam = (id) => deleteDoc(doc(db, "exams", id));

// Notes Actions
export const addNote = (data) => addDoc(collection(db, "notes"), {
  ...data,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
});

export const updateNote = (id, data) => updateDoc(doc(db, "notes", id), {
  ...data,
  updatedAt: serverTimestamp()
});

export const deleteNote = (id) => deleteDoc(doc(db, "notes", id));

// Messenger Actions
export const sendMessage = async (chatId, senderId, text) => {
  return addDoc(collection(db, `chats/${chatId}/messages`), {
    senderId,
    text,
    timestamp: serverTimestamp()
  });
};

export const createOrGetChat = async (userId1, userId2) => {
  const chatsRef = collection(db, "chats");
  const q = query(chatsRef, where("members", "array-contains", userId1));
  const snapshot = await getDocs(q);
  
  let chat = snapshot.docs.find(doc => doc.data().members.includes(userId2));
  
  if (!chat) {
    const newChat = await addDoc(chatsRef, {
      members: [userId1, userId2],
      createdAt: serverTimestamp(),
      type: 'private'
    });
    return newChat.id;
  }
  
  return chat.id;
};

// Community Actions
export const sendCommunityMessage = (room, senderId, senderName, text) => {
  return addDoc(collection(db, `community/${room}/messages`), {
    senderId,
    senderName,
    text,
    timestamp: serverTimestamp()
  });
};
