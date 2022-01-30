//grabs an item and it's reviews then calculates the average rating
module.exports = reviewAverage = (item) => {
    let totalReviews = null
    for (let reviews of item.reviews) {
        totalReviews += reviews.rating
    }
    const average = Math.round(totalReviews / (item.reviews.length))
    return average
}