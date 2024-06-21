//grabbing the user ID and cart total from the page. I can probably do this a bit differently now that I have the whole shopping cart, but I'd rather not modify it
let preId = document.querySelector("#id").innerText
let prePrice = document.querySelector("#price").innerText
let price = prePrice.slice(8)
let id = preId.slice(4)


// This grabs the items out of the cart, formats them for paypal, then pushes them
// into the cart variable. It needs to be a var so it can be accessed. DO NOT MESS WITH THIS
var cart = []
const getCart = async (userID) => {
    let functionCart = []
    try {
        const axiosResponse = await axios.get(`/payment/items/${userID}`)
        var shoppingCart = axiosResponse.data
    }
    catch (e) {
        console.log("ERROR IN AXIOS.GET")
        console.log(e)
    }
    for (let i = 0; i < shoppingCart.length; i++) {
        const paypalItem = {
            name: shoppingCart[i].name,
            description: "TEXT",
            unit_amount: {
                currency_code: "USD",
                value: shoppingCart[i].price
            },
            quantity: 1
        }
        functionCart.push(paypalItem)
    }

    cart = functionCart
}
getCart(id)


paypal.Buttons({
    createOrder: async function (data, actions) {

        return actions.order.create({
            purchase_units: [{
                amount: {
                    currency_code: "USD",
                    value: price,
                    breakdown: {
                        item_total: {
                            currency_code: "USD",
                            value: price
                        }
                    }
                },
                // puts the formatted item list into the paypal object so it shows up on checkout and in the transaction
                items: cart
            }]
        });
    },

    // Finalize the transaction after payer approval
    onApprove: function (data, actions) {
        return actions.order.capture().then(async function (orderData) {

            // Successful capture! For dev/demo purposes:
            console.log('Capture result', orderData, JSON.stringify(orderData, null, 2));
            // const transaction = orderData.purchase_units[0].payments.captures[0];
            // alert('Transaction ' + transaction.status + ': ' + transaction.id + '\n\nSee console for all available details');
            try {
                const response = await axios.post("/payment/transaction", { orderData, id })
                var transactionId = response.data
                console.log(transactionId)
            }
            catch (e) {
                console.log(e)
            }
            window.location.assign(`/payment/complete/${transactionId}`)
        });
    }
}).render('#paypal-button-container');

