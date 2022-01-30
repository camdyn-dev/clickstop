//very self explanatory; gets the current date and returns it in a string like "January 28th, 2022"
module.exports = getDate = () => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    let currentDate = new Date();
    let cDay = currentDate.getDate()
    let cMonth = currentDate.getMonth()
    let cYear = currentDate.getFullYear()
    const date = `${months[cMonth]} ${cDay}, ${cYear}`
    return date
}