// Import the Firebase SDK
import firebase from "firebase/app"
import "firebase/auth"
import "firebase/firestore"

// Firebase Configuration
// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id",
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig)

// Initialize Firebase services
const auth = firebase.auth()
const db = firebase.firestore()

// Sample articles data (in a real app, this would come from an API)
const sampleArticles = [
  {
    id: "article1",
    title: "Revolutionary AI Technology Transforms Healthcare",
    content:
      "Artificial Intelligence is making unprecedented advances in healthcare, with new diagnostic tools showing remarkable accuracy in detecting diseases early. This breakthrough technology promises to revolutionize patient care and medical outcomes worldwide.",
    preview: "AI technology is revolutionizing healthcare with new diagnostic tools showing remarkable accuracy...",
    category: "technology",
    publishedAt: new Date("2024-01-15"),
    sourceUrl: "https://example.com/ai-healthcare",
    imageUrl: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "article2",
    title: "Global Climate Summit Reaches Historic Agreement",
    content:
      "World leaders have reached a groundbreaking agreement on climate action, committing to ambitious targets for carbon reduction and renewable energy adoption. The summit marks a turning point in global environmental policy.",
    preview:
      "World leaders reach groundbreaking agreement on climate action with ambitious carbon reduction targets...",
    category: "environment",
    publishedAt: new Date("2024-01-14"),
    sourceUrl: "https://example.com/climate-summit",
    imageUrl: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "article3",
    title: "Breakthrough in Quantum Computing Achieved",
    content:
      "Scientists have achieved a major breakthrough in quantum computing, demonstrating quantum supremacy in solving complex mathematical problems. This advancement could revolutionize computing, cryptography, and scientific research.",
    preview: "Scientists achieve major breakthrough in quantum computing, demonstrating quantum supremacy...",
    category: "technology",
    publishedAt: new Date("2024-01-13"),
    sourceUrl: "https://example.com/quantum-computing",
    imageUrl: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "article4",
    title: "New Study Reveals Benefits of Mediterranean Diet",
    content:
      "A comprehensive study involving 50,000 participants shows that the Mediterranean diet significantly reduces the risk of heart disease and improves cognitive function. The research provides strong evidence for dietary lifestyle changes.",
    preview: "Comprehensive study shows Mediterranean diet significantly reduces heart disease risk...",
    category: "health",
    publishedAt: new Date("2024-01-12"),
    sourceUrl: "https://example.com/mediterranean-diet",
    imageUrl: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "article5",
    title: "Olympic Games Set New Sustainability Standards",
    content:
      "The upcoming Olympic Games will set new standards for sustainability, featuring carbon-neutral venues and innovative waste reduction programs. Organizers aim to create a blueprint for future sporting events.",
    preview: "Upcoming Olympic Games set new sustainability standards with carbon-neutral venues...",
    category: "sports",
    publishedAt: new Date("2024-01-11"),
    sourceUrl: "https://example.com/olympic-sustainability",
    imageUrl: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "article6",
    title: "Cryptocurrency Market Shows Signs of Recovery",
    content:
      "After months of volatility, the cryptocurrency market is showing strong signs of recovery with major coins gaining significant value. Analysts point to increased institutional adoption and regulatory clarity as key factors.",
    preview: "Cryptocurrency market shows strong recovery signs with major coins gaining value...",
    category: "business",
    publishedAt: new Date("2024-01-10"),
    sourceUrl: "https://example.com/crypto-recovery",
    imageUrl: "/placeholder.svg?height=200&width=300",
  },
]

// Available tags/categories
const availableTags = [
  { id: "technology", name: "Technology", icon: "fas fa-microchip", color: "primary" },
  { id: "health", name: "Health", icon: "fas fa-heartbeat", color: "success" },
  { id: "sports", name: "Sports", icon: "fas fa-football-ball", color: "warning" },
  { id: "business", name: "Business", icon: "fas fa-chart-line", color: "info" },
  { id: "entertainment", name: "Entertainment", icon: "fas fa-film", color: "danger" },
  { id: "environment", name: "Environment", icon: "fas fa-leaf", color: "success" },
]

// Initialize sample data in Firestore (run once)
async function initializeSampleData() {
  try {
    // Check if articles already exist
    const articlesSnapshot = await db.collection("articles").limit(1).get()
    if (articlesSnapshot.empty) {
      // Add sample articles
      for (const article of sampleArticles) {
        await db.collection("articles").doc(article.id).set(article)
      }
      console.log("Sample articles initialized")
    }
  } catch (error) {
    console.error("Error initializing sample data:", error)
  }
}

// Call initialization when the page loads
document.addEventListener("DOMContentLoaded", () => {
  initializeSampleData()
})
