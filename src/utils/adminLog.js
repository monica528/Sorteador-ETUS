import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/firebase';

export async function addAdminLog(user, action, details) {
  try {
    await addDoc(collection(db, 'admin_logs'), {
      action,
      details,
      userId: user.uid,
      userEmail: user.email,
      userName: user.displayName || user.email.split('@')[0],
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Failed to write admin log:', err.message);
  }
}
