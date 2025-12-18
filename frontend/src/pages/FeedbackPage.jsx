import { useState } from "react"
import { Star } from "lucide-react"

const FeedbackPage = () => {
  const [feedback, setFeedback] = useState({
    name: "",
    rating: 0,
    comment: "",
    location: ""
  })
  const [submitted, setSubmitted] = useState(false)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [isRatingSet, setIsRatingSet] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // Store in localStorage for now (in real app, send to backend)
    const existingFeedback = JSON.parse(localStorage.getItem("farmFeedback") || "[]")
    const newFeedback = {
      ...feedback,
      id: Date.now(),
      date: new Date().toISOString()
    }
    localStorage.setItem("farmFeedback", JSON.stringify([...existingFeedback, newFeedback]))
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFeedback({ name: "", rating: 0, comment: "", location: "" })
      setHoveredRating(0)
      setIsRatingSet(false)
    }, 3000)
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-success-600 p-6 text-white">
          <h1 className="text-2xl font-bold mb-1">💬 Share Your Experience</h1>
          <p className="text-sm text-primary-100">Help other farmers by sharing your experience with our irrigation system</p>
        </div>
        <div className="p-6">

        {submitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <div className="text-green-600 text-4xl">✓</div>
            </div>
            <h2 className="text-xl font-bold text-green-600 mb-1">Thank You!</h2>
            <p className="text-sm text-gray-600">Your feedback has been submitted successfully.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                <input
                  type="text"
                  value={feedback.name}
                  onChange={(e) => setFeedback({ ...feedback, name: e.target.value })}
                  placeholder="Enter your name"
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={feedback.location}
                  onChange={(e) => setFeedback({ ...feedback, location: e.target.value })}
                  placeholder="Your farm location"
                  className="input"
                  required
                />
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating ({feedback.rating > 0 ? feedback.rating.toFixed(1) : '0'}/5)
              </label>
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const fillPercentage = Math.max(0, Math.min(1, feedback.rating - (star - 1)))
                  const hoverFill = hoveredRating >= star ? 1 : (hoveredRating >= star - 0.5 ? 0.5 : 0)
                  
                  return (
                    <div key={star} className="relative">
                      {/* Left half - for half star */}
                      <button
                        type="button"
                        onClick={() => {
                          setFeedback({ ...feedback, rating: star - 0.5 })
                          setIsRatingSet(true)
                        }}
                        onMouseEnter={() => !isRatingSet && setHoveredRating(star - 0.5)}
                        onMouseLeave={() => !isRatingSet && setHoveredRating(0)}
                        className="absolute left-0 top-0 w-1/2 h-full z-10 cursor-pointer"
                      />
                      {/* Right half - for full star */}
                      <button
                        type="button"
                        onClick={() => {
                          setFeedback({ ...feedback, rating: star })
                          setIsRatingSet(true)
                        }}
                        onMouseEnter={() => !isRatingSet && setHoveredRating(star)}
                        onMouseLeave={() => !isRatingSet && setHoveredRating(0)}
                        className="absolute right-0 top-0 w-1/2 h-full z-10 cursor-pointer"
                      />
                      {/* Background star */}
                      <Star className="w-7 h-7 text-gray-300" />
                      {/* Filled star */}
                      <div 
                        className="absolute top-0 left-0 overflow-hidden transition-all duration-200"
                        style={{ width: `${(isRatingSet ? fillPercentage : hoverFill) * 100}%` }}
                      >
                        <Star className="w-7 h-7 text-yellow-400 fill-current drop-shadow-lg" />
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="text-xs font-medium text-gray-600">
                {feedback.rating === 0 && "Click on stars to rate"}
                {feedback.rating > 0 && feedback.rating <= 2 && "😞 Poor"}
                {feedback.rating > 2 && feedback.rating <= 3 && "😐 Average"}
                {feedback.rating > 3 && feedback.rating <= 4 && "😊 Good"}
                {feedback.rating > 4 && "🤩 Excellent"}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
              <textarea
                value={feedback.comment}
                onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
                placeholder="Share your experience with our irrigation system..."
                className="input"
                rows="4"
                required
              />
            </div>

            <button type="submit" className="w-full btn-primary py-3">
              Submit Feedback
            </button>
          </form>
        )}
        </div>
      </div>
    </div>
  )
}

export default FeedbackPage