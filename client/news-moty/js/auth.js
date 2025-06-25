// Authentication Management

let currentUser = null

// Initialize Firebase services (replace with your actual Firebase config)
const auth = firebase.auth()
const db = firebase.firestore()

// Check authentication state
auth.onAuthStateChanged((user) => {
  currentUser = user
  updateNavigation()

  if (user) {
    // User is signed in
    console.log("User signed in:", user.email)
    updateUserGreeting(user)
    checkAdminAccess(user)
  } else {
    // User is signed out
    console.log("User signed out")
    hideAdminElements()
  }
})

// Update navigation based on auth state
function updateNavigation() {
  const loginLink = document.getElementById("loginLink")
  const registerLink = document.getElementById("registerLink")
  const logoutLink = document.getElementById("logoutLink")
  const userGreeting = document.getElementById("userGreeting")

  if (currentUser) {
    if (loginLink) loginLink.style.display = "none"
    if (registerLink) registerLink.style.display = "none"
    if (logoutLink) logoutLink.style.display = "block"
    if (userGreeting) userGreeting.style.display = "block"
  } else {
    if (loginLink) loginLink.style.display = "block"
    if (registerLink) registerLink.style.display = "block"
    if (logoutLink) logoutLink.style.display = "none"
    if (userGreeting) userGreeting.style.display = "none"
  }
}

// Update user greeting
function updateUserGreeting(user) {
  const greetingText = document.getElementById("greetingText")
  if (greetingText && user) {
    const hour = new Date().getHours()
    let greeting = "Hello"

    if (hour < 12) greeting = "Good morning"
    else if (hour < 18) greeting = "Good afternoon"
    else greeting = "Good evening"

    // Get user name from Firestore or use email
    db.collection("users")
      .doc(user.uid)
      .get()
      .then((doc) => {
        const userName = doc.exists ? doc.data().name : user.email.split("@")[0]
        greetingText.textContent = `${greeting}, ${userName}!`
      })
      .catch(() => {
        greetingText.textContent = `${greeting}, ${user.email.split("@")[0]}!`
      })
  }
}

// Check admin access
async function checkAdminAccess(user) {
  try {
    const userDoc = await db.collection("users").doc(user.uid).get()
    if (userDoc.exists && userDoc.data().isAdmin) {
      showAdminElements()
    } else {
      hideAdminElements()
    }
  } catch (error) {
    console.error("Error checking admin access:", error)
    hideAdminElements()
  }
}

// Show/hide admin elements
function showAdminElements() {
  const adminLink = document.getElementById("adminLink")
  if (adminLink) adminLink.style.display = "block"
}

function hideAdminElements() {
  const adminLink = document.getElementById("adminLink")
  if (adminLink) adminLink.style.display = "none"
}

// Login form handler
if (document.getElementById("loginForm")) {
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault()

    const email = document.getElementById("email").value
    const password = document.getElementById("password").value
    const errorMessage = document.getElementById("errorMessage")
    const loadingSpinner = document.getElementById("loadingSpinner")

    // Show loading
    loadingSpinner.style.display = "block"
    errorMessage.style.display = "none"

    try {
      await auth.signInWithEmailAndPassword(email, password)

      // Update login stats
      await updateLoginStats()

      // Redirect to home page
      window.location.href = "index.html"
    } catch (error) {
      console.error("Login error:", error)
      errorMessage.textContent = getErrorMessage(error.code)
      errorMessage.style.display = "block"
    } finally {
      loadingSpinner.style.display = "none"
    }
  })
}

// Register form handler
if (document.getElementById("registerForm")) {
  const passwordInput = document.getElementById("password")
  const confirmPasswordInput = document.getElementById("confirmPassword")
  const passwordStrength = document.getElementById("passwordStrength")
  const passwordMatch = document.getElementById("passwordMatch")

  // Password strength validation
  if (passwordInput) {
    passwordInput.addEventListener("input", function () {
      const password = this.value
      const strength = checkPasswordStrength(password)

      passwordStrength.textContent = strength.text
      passwordStrength.className = strength.class
    })
  }

  // Password match validation
  if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener("input", function () {
      const password = passwordInput.value
      const confirmPassword = this.value

      if (confirmPassword === "") {
        passwordMatch.textContent = ""
        return
      }

      if (password === confirmPassword) {
        passwordMatch.textContent = "Passwords match"
        passwordMatch.className = "text-success"
      } else {
        passwordMatch.textContent = "Passwords do not match"
        passwordMatch.className = "text-danger"
      }
    })
  }

  document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault()

    const name = document.getElementById("name").value
    const email = document.getElementById("email").value
    const password = document.getElementById("password").value
    const confirmPassword = document.getElementById("confirmPassword").value
    const errorMessage = document.getElementById("errorMessage")
    const successMessage = document.getElementById("successMessage")
    const loadingSpinner = document.getElementById("loadingSpinner")

    // Validate passwords match
    if (password !== confirmPassword) {
      errorMessage.textContent = "Passwords do not match"
      errorMessage.style.display = "block"
      return
    }

    // Check password strength
    const strength = checkPasswordStrength(password)
    if (strength.score < 2) {
      errorMessage.textContent = "Password is too weak. Please use a stronger password."
      errorMessage.style.display = "block"
      return
    }

    // Show loading
    loadingSpinner.style.display = "block"
    errorMessage.style.display = "none"
    successMessage.style.display = "none"

    try {
      // Create user account
      const userCredential = await auth.createUserWithEmailAndPassword(email, password)
      const user = userCredential.user

      // Save user profile to Firestore
      await db
        .collection("users")
        .doc(user.uid)
        .set({
          name: name,
          email: email,
          tags: [],
          isAdmin: email === "admin@newshub.com", // Make admin@newshub.com an admin
          isBlocked: false,
          canShare: true,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        })

      successMessage.textContent = "Account created successfully! Redirecting..."
      successMessage.style.display = "block"

      // Redirect after 2 seconds
      setTimeout(() => {
        window.location.href = "index.html"
      }, 2000)
    } catch (error) {
      console.error("Registration error:", error)
      errorMessage.textContent = getErrorMessage(error.code)
      errorMessage.style.display = "block"
    } finally {
      loadingSpinner.style.display = "none"
    }
  })
}

// Logout function
async function logout() {
  try {
    await auth.signOut()
    window.location.href = "index.html"
  } catch (error) {
    console.error("Logout error:", error)
  }
}

// Update login stats
async function updateLoginStats() {
  if (!currentUser) return

  const today = new Date().toISOString().split("T")[0]
  const statsRef = db.collection("stats").doc("daily").collection("logins").doc(today)

  try {
    await statsRef.set(
      {
        count: firebase.firestore.FieldValue.increment(1),
        date: today,
      },
      { merge: true },
    )
  } catch (error) {
    console.error("Error updating login stats:", error)
  }
}

// Password strength checker
function checkPasswordStrength(password) {
  let score = 0
  let text = ""
  let className = ""

  if (password.length >= 8) score++
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  switch (score) {
    case 0:
    case 1:
      text = "Very Weak"
      className = "password-weak"
      break
    case 2:
      text = "Weak"
      className = "password-weak"
      break
    case 3:
      text = "Medium"
      className = "password-medium"
      break
    case 4:
      text = "Strong"
      className = "password-strong"
      break
    case 5:
      text = "Very Strong"
      className = "password-strong"
      break
  }

  return { score, text, class: className }
}

// Get user-friendly error messages
function getErrorMessage(errorCode) {
  switch (errorCode) {
    case "auth/user-not-found":
      return "No account found with this email address."
    case "auth/wrong-password":
      return "Incorrect password."
    case "auth/email-already-in-use":
      return "An account with this email already exists."
    case "auth/weak-password":
      return "Password is too weak."
    case "auth/invalid-email":
      return "Invalid email address."
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later."
    default:
      return "An error occurred. Please try again."
  }
}

// Check if user is logged in (utility function)
function requireAuth() {
  if (!currentUser) {
    window.location.href = "login.html"
    return false
  }
  return true
}

// Check if user is admin
async function requireAdmin() {
  if (!currentUser) {
    window.location.href = "login.html"
    return false
  }

  try {
    const userDoc = await db.collection("users").doc(currentUser.uid).get()
    if (!userDoc.exists || !userDoc.data().isAdmin) {
      return false
    }
    return true
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}
