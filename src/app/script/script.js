import mongoose from 'mongoose';
import checklistModel from '../models/checklist.model';
import companySupplierModel from '../models/companySuppliers.model';
import locationModel from '../models/location.model';
import productRangItemModel from '../models/productRangeItems.model';
import supplierProductModel from '../models/supplierProducts.model';
import supplierModel from '../models/supplier.model';
import Message from '../../config/message';
import supplierCategoryModel from '../models/supplierCategory.model';

exports.businessIdReplace = async (req, res) => {
    try {
        const { params } = req.body;
        const to = params.to;
        const from = params.from;
        let supplierIdArray = [];
        let supplierCategoryArray = [];
        let supplierProductArray = [];
        let locationArray = [];
        let originalLocationArray = [];
        let productRangArray = [];
        let supplierData = await supplierModel.find({ businessId: mongoose.Types.ObjectId(from) }).exec()
        for (let i = 0; i < supplierData.length; i++) {
            let tempIterator = supplierData[i].toObject();
            delete tempIterator._id;
            tempIterator.businessId = mongoose.Types.ObjectId(to);
            let newSupplierData = await supplierModel.create(tempIterator);

            //**Company supplier */
            let tempCompanySupplier = await companySupplierModel.findOne({ supplierId: supplierData[i]._id }).exec();
            let newCompanySupplier = tempCompanySupplier.toObject();
            delete newCompanySupplier._id;
            newCompanySupplier.businessId = mongoose.Types.ObjectId(to);
            newCompanySupplier.supplierId = newSupplierData._id;
            let createNewCompanySupplier = await companySupplierModel.create(newCompanySupplier);
            supplierIdArray[tempCompanySupplier._id] = createNewCompanySupplier._id;

            //**Supplier Category*/
            const category = await supplierCategoryModel.find({supplierId: tempCompanySupplier._id}).exec();
            if(category.length > 0){
                for(let singleCategory of category){
                    let newSingleCategory = singleCategory.toObject();
                    delete newSingleCategory._id;
                    newSingleCategory.supplierId = supplierIdArray[singleCategory.supplierId];
                    let newSupplierCategory = await supplierCategoryModel.create(newSingleCategory);
                    supplierCategoryArray[singleCategory._id] = (await newSupplierCategory)._id;
                }
            }

            //**Supplier Product */
            const supplierProduct = await supplierProductModel.find({supplierId: tempCompanySupplier._id}).exec();
            if(supplierProduct.length > 0){
                for(let singleSupplierProduct of supplierProduct){
                    let newSingleSupplierProduct = singleSupplierProduct.toObject();
                    delete newSingleSupplierProduct._id;
                    newSingleSupplierProduct.supplierId = supplierIdArray[singleSupplierProduct.supplierId];
                    newSingleSupplierProduct.businessId = mongoose.Types.ObjectId(to);
                    newSingleSupplierProduct.categoryId = supplierCategoryArray[singleSupplierProduct.categoryId];
                    let newSupplierProduct = await supplierProductModel.create(newSingleSupplierProduct);
                    supplierProductArray[singleSupplierProduct._id] = newSupplierProduct._id;
                }
            }

        }


        //**Location */
        const parentLocation = await locationModel.find({ businessId: mongoose.Types.ObjectId(from) }).exec()
        if(parentLocation.length > 0){
            let i=0;
            for(let singleParentLocation of parentLocation){
                let tempSingleParentLocation = singleParentLocation.toObject();
                delete tempSingleParentLocation._id;
                tempSingleParentLocation.businessId = mongoose.Types.ObjectId(to);
                const newParentLoaction = await locationModel.create(tempSingleParentLocation);
                locationArray[singleParentLocation._id] = newParentLoaction._id;
                originalLocationArray[i] = newParentLoaction._id;
                i++;
            }
        }

        const parentLocation2 = await locationModel.find({ businessId: mongoose.Types.ObjectId(from) }).exec()
        if(parentLocation2.length > 0){
            let i = 0;
            for(let singleParentLocation of parentLocation2){
                await locationModel.findByIdAndUpdate(originalLocationArray[i],{parentId: locationArray[singleParentLocation.parentId]},{new:true})
                .then(result => {
                    i++;
                })
            }
        }

        //**ProductRange */
        const productRange = await productRangItemModel.find({businessId: mongoose.Types.ObjectId(from)}).exec();
        if(productRange.length > 0){
            for(let singleProductRange of productRange){
                let tempSingleProductRange = singleProductRange.toObject();
                delete tempSingleProductRange._id;
                tempSingleProductRange.suppliersProduct = [];
                tempSingleProductRange.businessId = mongoose.Types.ObjectId(to);
                tempSingleProductRange.locationId = locationArray[singleProductRange.locationId];
                if(singleProductRange.suppliersProduct.length > 0){
                    for(let supplierProduct of singleProductRange.suppliersProduct){
                        if(supplierProduct.id !== undefined){
                            supplierProduct.id = supplierIdArray[supplierProduct.id];
                        }
                        if(supplierProduct.supplierProductId !== undefined){
                            supplierProduct.supplierProductId = supplierProductArray[supplierProduct.supplierProductId];
                        }
                        tempSingleProductRange.suppliersProduct.push(supplierProduct)
                    }
                }
                const newProductRange = await productRangItemModel.create(tempSingleProductRange);
                productRangArray[singleProductRange._id] = newProductRange._id;
            }
        }

        //**Checklist */
        const checklist = await checklistModel.find({businessId: mongoose.Types.ObjectId(from)}).exec();
        if(checklist.length > 0){
            for(let singleChecklist of checklist){
                let tempSingleChecklist = singleChecklist.toObject();
                delete tempSingleChecklist._id;
                tempSingleChecklist.businessId = mongoose.Types.ObjectId(to);
                for(let i=0;i<tempSingleChecklist.product.length;i++){
                    tempSingleChecklist.product[i] = productRangArray[tempSingleChecklist.product[i]];
                }
                await checklistModel.create(tempSingleChecklist);
                // for(let tempProduct of tempSingleChecklist.product.values){
                //     tempProduct
                // }
            }
        }
        res.status(200).send({
            code: 200,
            message: Message.infoMessage.scriptRun,
            data: [],
            error: []
        });
    } catch (err) {
        res.status(400).send({
            code: 400,
            message: Message.errorMessage.genericError,
            data: [],
            error: err
        });
    }
}