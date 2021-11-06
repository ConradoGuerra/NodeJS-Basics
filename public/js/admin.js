const deleteProduct = function (btn) {
  //Selecting the parent node of bt and the atribute selector of the btn clicked
  const prodId = btn.parentNode.querySelector("[name=productId]").value;
  const csrf = btn.parentNode.querySelector("[name=_csrf]").value;

  //Getting the element of the card deleted
  const element = btn.closest("article");

  //Fetching the data from controller
  fetch("/admin/products/" + prodId, {
    //Defining the method
    method: "DELETE",
    //Sending via headers the csrf
    headers: {
      "csrf-token": csrf,
    },
  })
    .then((result) => {
      return result.json();
    })
    .then((data) => {
      console.log(data);
      //Removing from display
      element.remove();
    })
    .catch((err) => console.log(err));
};
