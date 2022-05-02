import nodeExcle from 'node-xlsx';
import uploadFile from '../../../utils/uploadFile';
import config from '../../../config/config';
import Message from '../../../config/message';
import supplierModel from '../../models/supplier.model';
import companySuppliersModel from '../../models/companySuppliers.model';
import supplierProducts from '../../models/supplierProducts.model';
import locationModel from '../../models/location.model';
import supplierCategory from '../../models/supplierCategory.model';
import productRangeItems from '../../models/productRangeItems.model';

exports.importExcel = async (req, res) => {
    try {
        const param = {
            'destination': 'excel',
            'decodeImage': "",
            fieldName: 'file',
            imageOrignalName: ''
        }
        await uploadFile.uploadFile(param, req, res)
        .then(async fileName => {
            const params = req.body;
            if(fileName != '' && fileName != null && fileName !== undefined) {
                await uploadExcel(res,params.businessAdminId,fileName);
            }
            else{
                res.status(200).send({ code: 200, Message: Message.errorMessage.fileNotFound, data: [], err: [] })
            }
        })
    } catch (err) {
        console.log('error', err)
        res.status(400).send({ code: 400, message: Message.errorMessage.genericError, data: [], error: err });
    }
};
let uploadExcel = async (res,businessAdminId,fileName) => {
    const usersSheet = nodeExcle.parse(config.uploadFilePath+'excel/'+fileName);
    const supplier = [];
    const supplierIdArray = [];
    const categoryIdArray = [];
    const supplierProductIdArray = [];
    const locationIdArray = [];
    const companySupplierIdArray = [];
    const globalLocationIdArray = [];
    for (let i = 1; i < usersSheet[0].data.length; i++) {
        if (usersSheet[0].data[i][1]) {
            supplier.push({
                name: usersSheet[0].data[i][1],
                productHaveUniqueCode: usersSheet[0].data[i][3],
                productHaveCategory: usersSheet[0].data[i][2],
                orderEmail: usersSheet[0].data[i][4],
                openingDays: usersSheet[0].data[i][9],
                deliveryDaysAllowed: usersSheet[0].data[i][10].split(','),
                businessId: businessAdminId,
                logo: (usersSheet[0].data[i][12])? usersSheet[0].data[i][12] : "",
                type: usersSheet[0].data[i][11],
                updatedAt: new Date(),
                createdAt: new Date()
            })
        }
    };
    supplierModel.insertMany(supplier).then((suppliers) => {
            return suppliers;
        }).then((suppliers) => {
            const companySupplierArray = [];
            for (let i = 1; i < suppliers.length+1; i++) {
                companySupplierArray.push({
                    supplierId: suppliers[i-1]._id,
                    orderEmail: usersSheet[0].data[i][4],
                    minOrderProduct: usersSheet[0].data[i][5],
                    placeOrderAhead: usersSheet[0].data[i][6],
                    placeOrderBeforeTime: usersSheet[0].data[i][7],
                    deliveryDaysStandard: usersSheet[0].data[i][8].split(','),
                    logo: (usersSheet[0].data[i][12])? usersSheet[0].data[i][12] : "",
                    businessId: businessAdminId,
                    type: usersSheet[0].data[i][11],
                    updatedAt: new Date(),
                    createdAt: new Date()
                });
            }
            return companySuppliersModel.insertMany(companySupplierArray).then((companySuppliers) => {
                for (let i = 1; i < usersSheet[0].data.length; i++) {
                    if (usersSheet[0].data[i][0]) {
                        companySupplierIdArray[Number(usersSheet[0].data[i][0])] = companySuppliers[i - 1]._id;
                    }
                }
                return companySuppliers;
            })
        })
        .then((companySuppliers) => {
            for (let i = 1; i < usersSheet[0].data.length; i++) {

                if (usersSheet[0].data[i][0]) {
                    supplierIdArray[Number(usersSheet[0].data[i][0])] = companySuppliers[i - 1]._id;
                }
            }
            return supplierIdArray;
        })
        .then((supplierIdArray) => {
            const catagoryArray = [];
            for (let i = 1; i < usersSheet[1].data.length; i++) {
                if (usersSheet[1].data[i][0]) {
                    catagoryArray.push({
                        name: usersSheet[1].data[i][1],
                        supplierId: supplierIdArray[usersSheet[1].data[i][2]],
                        updatedAt: new Date(),
                        createdAt: new Date()
                    });
                }
            }
            return supplierCategory.insertMany(catagoryArray).then((category) => {
                return category;
            });
        })
        .then((categories) => {
            for (let i = 1; i < usersSheet[1].data.length; i++) {
                if (usersSheet[1].data[i][0]) {
                    categoryIdArray[Number(usersSheet[1].data[i][0])] = categories[i - 1]._id;
                }
            }
            return categoryIdArray;
        })
        .then((categoryIdArray) => {
            const supplierProduct = [];
            for (let i = 1; i < usersSheet[2].data.length; i++) {
                if (usersSheet[2].data[i][0]) {
                    supplierProduct.push({
                        supplierId: supplierIdArray[Number(usersSheet[2].data[i][1])],
                        packaging: usersSheet[2].data[i][2],
                        name: usersSheet[2].data[i][3],
                        uniqueProductKey: usersSheet[2].data[i][4],
                        categoryId: categoryIdArray[Number(usersSheet[2].data[i][5])],
                        minOrder: usersSheet[2].data[i][6],
                        orderBy: usersSheet[2].data[i][7],
                        businessId: businessAdminId,
                        image: (usersSheet[2].data[i][8])?usersSheet[2].data[i][8]:"",
                        updatedAt: new Date(),
                        createdAt: new Date()
                    });
                }
            }
            return supplierProducts.insertMany(supplierProduct).then((supplierProducts) => {
                return supplierProducts;
            })
        })
        .then((supplierProducts) => {
            for (let i = 1; i < usersSheet[2].data.length; i++) {
                if (usersSheet[2].data[i][0]) {
                    supplierProductIdArray[Number(usersSheet[2].data[i][0])] = supplierProducts[i - 1]._id;
                }
            }
            return supplierProductIdArray;
        })
        .then((supplierProductIdArray) => {
            const locationArray = [];
            for (let i = 1; i < usersSheet[3].data.length; i++) {
                if (usersSheet[3].data[i][0]) {
                    locationArray.push({
                        name: usersSheet[3].data[i][2],
                        preferredIndex: usersSheet[3].data[i][3],
                        businessId: businessAdminId,
                        updatedAt: new Date(),
                        createdAt: new Date()
                    });
                }
            }
            return locationModel.insertMany(locationArray).then((locations) => {
                for (let i = 1; i < usersSheet[3].data.length; i++) {
                    if (usersSheet[3].data[i][0]) {
                        globalLocationIdArray.push(locations[i - 1]._id)
                        locationIdArray[Number(usersSheet[3].data[i][0])] = locations[i - 1]._id;
                    }
                }
                return locations;
            });
        })
        .then((locations) => {
            for (let i = 1; i < usersSheet[3].data.length; i++) {
                if (usersSheet[3].data[i][0]) {
                    if (Number(usersSheet[3].data[i][1]) !== 0) {
                        locationModel.findByIdAndUpdate(locations[i - 1], {
                            parentId: locationIdArray[Number(usersSheet[3].data[i][1])]
                        }).then((updateLocation) => {})
                    }
                }
            }
            return locationIdArray;
        })
        .then(async (locationIdArray) => {
                for(let locationData of globalLocationIdArray) {
                    await locationModel.findById(locationData._id)
                    .then(async oneLocation => {
                        await locationModel.find({parentId:oneLocation._id})
                        .then(async locationList => {
                            for (let location of locationList) {
                                let preferredIndex = oneLocation.preferredIndex + "-" + location.preferredIndex;
                                await locationModel.findByIdAndUpdate(location._id,{preferredIndex: preferredIndex},{new:true}).exec()
                            }
                        })
                    })
                }
            return locationIdArray;
        })
        .then(async (locationIdArray) => {
            const productRangeItemArray = [];
            for (let i = 1; i < usersSheet[4].data.length; i++) {
                if (usersSheet[4].data[i][0] !== undefined && Number(usersSheet[4].data[i][0]) !== null) {
                    const tempSupplierProduct = [];
                    const supplierProductSplit = String(usersSheet[4].data[i][5]).split(',');
                    const calculationSplit = String(usersSheet[4].data[i][6]).split(',');
                    const sortOrderSplit = String(usersSheet[4].data[i][7]).split(',');
                    const supplierTypeSplit = String(usersSheet[4].data[i][10]).split(',');
                    const supplierSplit = String(usersSheet[4].data[i][9]).split(',');
                    for (let j = 0; j < supplierProductSplit.length; j++) {
                        tempSupplierProduct.push({
                            supplierProductId: supplierProductIdArray[Number(supplierProductSplit[j])],
                            preferredIndex: (sortOrderSplit[j] !== 0)?Number(sortOrderSplit[j]):0,
                            calculation: calculationSplit[j],
                            isSoldInStore: (supplierTypeSplit[j] == "0")?1:0,
                            id: companySupplierIdArray[Number(supplierSplit[j])]
                        })
                    }
                    productRangeItemArray.push({
                        name : usersSheet[4].data[i][2],
                        packaging: usersSheet[4].data[i][1],
                        suppliersProduct: tempSupplierProduct,
                        locationId: locationIdArray[Number(usersSheet[4].data[i][3])],
                        locationPreferredIndex: usersSheet[4].data[i][4],
                        standardQuantity: usersSheet[4].data[i][8],
                        image: (usersSheet[4].data[i][11] !== undefined && usersSheet[4].data[i][11]) ? usersSheet[4].data[i][11] : undefined,
                        businessId: businessAdminId,
                        updatedAt: new Date(),
                        createdAt: new Date()
                    });
                }
            }
            await productRangeItems.insertMany(productRangeItemArray).then((productRange) => {
                res.status(200).send({ code: 200, Message: Message.infoMessage.excelFileUploaded, data: [], err: [] })
            })  
        })
        .catch((err) => {
            console.log('error', err)
            res.status(400).send({ code: 400, Message: Message.errorMessage.genericError, data: [], err: err });
        });
}