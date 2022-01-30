//grabbing the user ID and cart total from the page. I can probably do this a bit differently now that I have the whole shopping cart but don wan fuc wit it
let preId = document.querySelector("#id").innerText
let prePrice = document.querySelector("#price").innerText
let price = prePrice.slice(8)
let id = preId.slice(4)


// This grabs the items out of the cart, formats them for paypal, then pushes them
// into the cart variable. It needs to be a var so it can be accessed. DO NOT FUCK WITH THIS
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


//i'm successfully recieving the data, but can't use it. confused as fucc rn, I can't extract it from the gODDAMN UHHH response
//finally fucking W O R K S
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
            // so, there're a few things I need to do here
            // 1: on the POST, I should find a way to pass the Transaction (database) ID so I can
            // 2: Redirect to an order summary page, passing the Transaction ID as the parameter, maybe something like
            // app.get("/paypalComplete/:id") 
            window.location.assign(`/payment/complete/${transactionId}`)
            // 3: figure out how the fuck I'm gonna do that stupid goddamn motherfucking P A G E

            // When ready to go live, remove the alert and show a success message within this page. For example:
            // var element = document.getElementById('paypal-button-container');
            // element.innerHTML = '';
            // element.innerHTML = '<h3>Thank you for your payment!</h3>';
            // Or go to another URL:  actions.redirect('thank_you.html');
        });
    }
}).render('#paypal-button-container');

