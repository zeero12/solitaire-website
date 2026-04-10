import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export async function getHeroNews() {
  try {
    const newsRef = collection(db, 'heroNews');
    
    // Fetch all items (max 15 synced by backend) to avoid composite index requirement
    const snapshot = await getDocs(newsRef);
    const news = [];
    snapshot.forEach(doc => {
      news.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort in memory: priority desc, then publishedAt desc
    news.sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
    
    return news.slice(0, 4);
  } catch (error) {
    console.error('Error fetching hero news:', error);
    return [];
  }
}
