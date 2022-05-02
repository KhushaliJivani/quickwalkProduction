module.exports = {
    errorMessage: {
        genericError: 'Something went wrong, please try again.',
        userNotFound: 'Please enter valid email or password',
        emailNotFound: 'Please enter valid email',
        tokenNotFound: 'Token not valid or expire',
        accountNotActive: 'Please verify your email address',
        userAlreadyExists: 'User Already exists.',
        passwordNotMatch: 'Current password not match.',
        dataNotValid: 'Data not valid',
        dataNotFound: 'Data not found',
        notLogin: 'admin please login first',
        imageUpload: 'image upload error',
        forbidden: "unauthorized you(forbidden)",
        productNotFound: "Product not found",
        productDeleteNotAllow: "First remove from checklist product and then delete",
        productRangeDeleteNotAllow: "First unlink with supplier product and then delete",
        supplierProductDeleteNotAllow: "First remove from productRangeItems product and then delete",
        storeDeleteNotAllow: "First remove from productRangeItems and then delete",
        fileNotFound:"File not found"
    },
    infoMessage: {
        saveUser: 'User Save Successfully',
        saveAdmin: 'Admin Save Successfully',
        saveProduct: 'Product Save Successfully',
        saveLocation: 'Location Save Successfully',
        login: 'Login Successfully',
        forgotPassword: 'Email sent, Please Check your email inbox',
        resetPassword: 'Password Reset successfully',
        accountVerify: 'Your account verify successfully.',
        updateProfile: 'Update profile successfully.',
        updateData: 'Update data successfully.',
        getUsers: 'Get Users successfully.',
        editUser: 'User Update successfully.',
        deleteUser: 'User delete successfully.',
        deleteChecklist: 'Checklist delete successfully.',
        deleteProduct: 'Product delete successfully.',
        deleteOrder: 'Order delete successfully.',
        updateOrder: 'Order update successfully.',
        getProfile: 'Get profile successfully.',
        languageGet: 'language data get successfully.',
        getDetails: 'get details successfully',
        alreadyDelete: 'Data already deleted',
        dataDelete: 'data delete successfully',
        flushShoppingList: 'Shoppinglist flush successfully',
        saveSupplier: 'supplier save successfully',
        suggestedProduct: 'Get suggested product successfully',
        assignSupplier: 'Product save successfully',
        linkProduct: 'Link Profucts Get successfully',
        linkedProduct: 'Product linked successfully',
        delinkProduct: 'Product delinked successfully',
        checklistCollection: "checklistCollection save successfully",
        orderSave: "Order save successfully",
        unCheckedProduct: "Product unchecked successfully",
        pdfGenerated: "PDF generated successfully",
        createOrder: "Create order successfully",
        changeDeliveryDate: "Your selected delivery date is expire of this product,So change delivery date",
        orderConfirm: 'Your order is confirm',
        checklistComninationPause: 'the checklist pause successfully',
        checklistCombinationName:'checklist Combination name not found',
        checkUpdate:'check product upDate sucessfully',
        checkSave:'Save check product sucessfully',
        alreadySubmitted: 'You have already submitted',
        dataNotAcceptable: 'data not acceptable',
        locationProduct :"Location product get successfully.",
        setProductOrder :"product ordering set",
        setLocationOrder :"Location ordering set",
        excelFileUploaded :"File uploaded successfully",
        scriptRun :"Script run successfully"
    },
    emails: {
        forgotPassword: {
            subject: '[QuickWalk] Password Reset',
            body: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n Please click on the following link, or paste this into your browser to complete the process:\n\n %s/pages/auth/reset-password/%s \n\n If you did not request this, please ignore this email and your password will remain unchanged.\n Thanks QuickWalk team \n'
        },
        resetPassword: {
            subject: '[QuickWalk] Your password has been changed',
            body: 'Hello,\n\n This is a confirmation that the password for your account %s has just been changed.\n Thanks QuickWalk team \n'
        },
        signup: {
            subject: '[QuickWalk] Please verify your email address',
            body: 'Hi %s,\nThanks so much for joining QuickWalk! To finish signing up, you just have to confirm that we got your email right. Click here to verify your email address - %s/pages/auth/verify/%s \n Thanks QuickWalk team \n'
        },
        verifyUser: {
            subject: '[QuickWalk] Welcome To QuickWalk',
            body: 'Hi %s,\nThanks so much for joining QuickWalk! Your password is %s. Click here to login - %s/pages/auth/login \n Thanks QuickWalk team \n'
        }
    },
    masterAdmin: {
        forgotPassword: {
            subject: '[QuickWalk] Password Reset',
            body: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n Please click on the following link, or paste this into your browser to complete the process:\n\n %spages/auth/reset-password/%s \n\n If you did not request this, please ignore this email and your password will remain unchanged.\n Thanks QuickWalk team \n'
        },
        resetPassword: {
            subject: '[QuickWalk] Your password has been changed',
            body: 'Hello %s,\n\n This is a confirmation that the password for your account %s has just been changed.\n Thanks QuickWalk team \n'
        },
    },
    quickwalkUser: {
        forgotPassword: {
            subject: '[QuickWalk] Password Reset',
            body: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n Please click on the following link, or paste this into your browser to complete the process:\n\n %sreset-password/%s \n\n If you did not request this, please ignore this email and your password will remain unchanged.\n Thanks QuickWalk team \n'
        },
        resetPassword: {
            subject: '[QuickWalk] Your password has been changed',
            body: 'Hello %s,\n\n This is a confirmation that the password for your account %s has just been changed.\n Thanks QuickWalk team \n'
        },
        verifyUser: {
            subject: '[QuickWalk] Welcome To QuickWalk',
            body: 'Hi %s,\nThanks so much for joining QuickWalk! Your password is %s. Click here to login - %slogin \n Thanks QuickWalk team \n'
        },
        signup: {
            subject: '[QuickWalk] Please verify your email address',
            body: 'Hi %s,\nWelcome to QuickWalk! \n\nTo finish the signing up, you just have to confirm that we got your email right. \n\nClick here to verify your email address - %sverify/%s \n Thanks QuickWalk team \n'
        }
    }
}