#load packages 
library(tidyverse)
library(pls)
library(leaps)

#import from csv file 
BANA_Comp_Data <- read_csv("BANA-Comp-Data.csv")

#view original data set 
view(BANA_Comp_Data)

#attach data set 
attach(BANA_Comp_Data)


#Data cleaning

#completeness 
#count number of missing values in salary
sum(is.na(BANA_Comp_Data)) 
#no value is missing 


#validity
#check data type
glimpse(BANA_Comp_Data)


#change data type of categorical variable from dbl to fct for further analysis 
#sex
BANA_Comp_Data$sex = as.factor(sex) 
#required confirmation with stakeholders. 
#At the moment, assume 0 represents male and 1 represent female 

#cp
BANA_Comp_Data$cp = as.factor(cp)

#fbs
BANA_Comp_Data$fbs = as.factor(fbs)

#restecg
BANA_Comp_Data$restecg = as.factor(restecg)

#exng
BANA_Comp_Data$exng = as.factor(exng)

#slp
BANA_Comp_Data$slp = as.factor(slp)

#thall
BANA_Comp_Data$thall = as.factor(thall)

#output
BANA_Comp_Data$output = as.factor(output)


#accuracy 
#check all possible observation in each variables
#age
unique(age)

#sex
unique(sex)

#cp
unique(cp)

#trtbps
unique(trtbps)

#chol
unique(chol)

#fbs
unique(fbs)

#restecg
unique(restecg)

#thalachh
unique(thalachh)

#exng
unique(exng)

#oldpeak 
unique(oldpeak)

#slp
unique(slp)

#caa
unique(BANA_Comp_Data$caa) #caa == 4 does not make sense 
#based on data dictionary provided by stakeholder 

#remove observations which caa equals to 4
BANA_Comp_Data.cleaned = BANA_Comp_Data[caa != '4',]
#check 
unique(BANA_Comp_Data$caa) #caa == 4 is removed 

#thall
unique(thall)

#output
unique(output)

#attach cleaned data set
attach(BANA_Comp_Data.cleaned)

#Dimension reduction

#find the best model to decide which variables should be included   

#Choosing Among Models Using the Validation-Set Approach and Cross-Validation

#randomly select training and testing samples 
train = sample(c(TRUE, FALSE), nrow(BANA_Comp_Data.cleaned), replace = TRUE)
test = (!train)

#apply regsubsets() to train 
regfit.best = regsubsets(output ~ ., data = BANA_Comp_Data.cleaned[train,], 
                         nvmax = ncol(BANA_Comp_Data.cleaned))

#make a model matrix from test data 
test.mat = model.matrix(Salary ~ ., data = Hitters_1[test,]) #building an “X” 
#matrix from data

#create vectors with 19 values to store results
val.errors = rep(NA, ncol(BANA_Comp_Data.cleaned))
for (i in 1:ncol(BANA_Comp_Data.cleaned)){
  coefi = coef(regfit.best, id = i) 
  pred = test.mat[,names(coefi)] %*% coefi
  val.errors[i] = mean((Hitters_1$Salary[test] - pred)^2)
}
val.errors
which.min(val.errors)



#Generalized linear model
glm.fit.1 = glm(output ~ ., data = BANA_Comp_Data.cleaned ,family = binomial)
glm.fit.1
summary(glm.fit.1)

#Generalized linear model
glm.fit = glm(output ~ cp+sex+caa, data = BANA_Comp_Data.cleaned ,family = binomial)
glm.fit
summary(glm.fit)

#coefficients of the model 
coef(glm.fit)

#predict probabilities 
glm.probs = predict(glm.fit, type="response")

#Example
##Chance of getting heart attack of a patient with chest pain type 2, 
##gender as female, 1 major vessel colored 
predict(glm.fit, newdata = 
          data.frame(cp = '2', sex = '1', caa = 1),type="response")


#replace the number with '0' or '1'
#0 means low chance of heart attack; while 1 means high chance of heart attack
#create a vector with all down first 
glm.pred = rep("0", dim(BANA_Comp_Data.cleaned)[1])

#find and replace value >0.5 with 1
glm.pred[glm.probs > 0.5] = "1"

#check the result by comparing the first 10 rows
glm.pred[1:10]
glm.probs[1:10]

#create Confusion  matrix to check how accurate of the model
cm = table(glm.pred, BANA_Comp_Data.cleaned$output)
cm

#calculate vectors of correct prediction (vcp) and store it 
vcp = (cm[1] + cm[4])/dim(BANA_Comp_Data)[1]
vcp

#visualization of significant factors

#show 4 visualizations at once 
par(mfrow = c(2,2))

#cp vs output
plot(BANA_Comp_Data.cleaned$cp, glm.probs, xlab = 'chest pain', ylab = 'chance of heart attack')
title('relationship of cp and output')


#caa vs output
plot(as.factor(BANA_Comp_Data.cleaned$caa), glm.probs, xlab = 'caa', ylab = 'chance of heart attack')
title('relationship of caa and output')


#sex vs output
plot(BANA_Comp_Data.cleaned$sex, glm.probs, xlab = 'sex', ylab = 'chance of heart attack')
title('relationship of sex and output')

#thall vs output
plot(BANA_Comp_Data.cleaned$thall, glm.probs, xlab = 'thall', ylab = 'chance of heart attack')
title('relationship of thall and output')

#main title 
title('significant factors', outer = TRUE)


#allocate patients to 4 different levels based on the chance of 
#getting heart attack

#create a vector to store dangerous level of each patient
danger_lv =  c(rep('danger', dim(BANA_Comp_Data.cleaned)[1]))


#replace 'danger' with associated dangerous level according to the chance 
for (i in 1:298){
  danger_lv[i] = if(glm.probs[i] > summary(glm.probs)[5]){
    danger_lv[i] = 'high danger'} #'high danger 
                             #if the probabilities are higher than 3rd quartile
    else if
      (glm.probs[i] <= summary(glm.probs)[5] 
       && glm.probs[i] > summary(glm.probs)[3]
      ){danger_lv[i] = 'considerable danger'}#'considerable danger 
  #if the probabilities are between 2nd quartile and 3rd quartile
    else if 
      (glm.probs[i] <= 
           summary(glm.probs)[3] && glm.probs[i] > summary(glm.probs)[2]
      ){danger_lv[i] = 'moderate danger'} #'moderate danger 
  #if the probabilities are between 1st quartile and 2nd quartile
    else
      danger_lv[i] = 'no or minor danger'
    }#'no or minor danger'
#if the probabilities are below 1st quartile
   
#check what values are in danger_lv
unique(danger_lv)

#Append glm.probs(chance of getting heart attack) 
#and danger_lv(chance of getting heart attack in 4 levels) to the data set
BANA_Comp_Data.output = cbind(BANA_Comp_Data.cleaned, glm.probs, danger_lv)

#view the output data set
view(BANA_Comp_Data.output)





