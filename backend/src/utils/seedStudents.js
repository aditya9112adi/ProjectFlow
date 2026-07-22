import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { StudentData } from '../models/StudentData.model.js';

const studentData = `
Suyash Dadaso Nikam	252921001
Maduri Sri Sainath Reddy	252921002
Gowtham Usirika	252921003
Guruprasad Babarao Godamgave	252921004
Pranav Vijay Shinde	252921006
Rasamalla Nihanth	252921007
Yashraj Sunil Lokhande	252921008
Seera Bhargav Naidu	252921009
Balakishan Akula	252921010
Jaya Surya Yellapu	252921011
Gundeti Charani Reddy	252921012
Miryala Shiva Sai	252921013
G G.thrinay Thrinay	252921014
Akul Yashwant Sawant	252921015
Kunal Deepak Rawool	252921016
Likhith Vemula	252921017
Kyama Akshith	252921018
Phalgun Sanjay Bhirud	252921019
Srihitha Parimisetti	252921020
Naveen Reddy Maligireddy	252921021
Ghanapuram Sampath	252921022
Jeevesh Jeevan Patil	252921023
Durv Kishore Thakare	252921024
Abhishek Shankar Kharat	252921025
Yashwant Suresh Rathod	252921026
Soham Shankar Belwadkar	252921027
Guthi Devika	252921028
Kancharla Sri Harsha	252921029
Paladi Sai	252921030
Pamba Venkata Mohan Ganesh	252921031
Jengali Surya Vishal	252921032
Chundru Vinny Praneeth	252921033
Kkovvada Vivekananda Naidu	252921034
Tejeshwar Jasti	252921035
Naveen Kumar Telugu	252921036
Naga Gopi Rangisetti	252921037
Shravani Dipak Jadhav	252921038
Katakam Bhavana	252921039
Surya Ram Charan Musunuru	252921040
P Laxmi Narshima Swamy Narshima Swamy	252921041
Manduri Naga Venkta Sai	252921042
Yash Ajay Jadhav	252921043
Prathmesh Balasaheb Kudale	252921044
Maddirala Karthikeya	252921045
Siddharth Suresh Patil	252921046
Kalekar Vaidhan	252921047
Aniket Kailas Salunke	252921048
Nirbhay Pankaj Gawad	252921049
Yashwanth.p	252921050
Yashwanth H M	252921051
Deekshith J	252921052
Shivraj Kailash Pathade	252921053
Shatakshi Amit Kharade	252921054
Bala Vamsi Krishna Vanjarapu	252921055
M. Uday Shankar	252921056
Vijay Kumar Pogula	252921057
Shlok Vilas Sutar	252921058
Prajwal Reddy Kurelly	252921059
Om Satish Garkal	252921060
Shaik Mohammad Umar	252921061
Yash Bhagwan Torwane	252921062
Gavva Shiva Ganesh	252921063
Suryajeet Sanjay Ghogare	252921064
Ansh Sanjay Gabhane	252921065
Harshavardhan Goud Esarapu	252921066
Sai Nihar Nemalikanti	252921067
Abhinash Vuddagiri	252921068
Bala Nithin Reddy Thumma	252921069
Kavali Pradeep Kumar	252921070
Deekshith Kiran Dharavath	252921071
Sabhavath Chandu Lal	252921072
Svara Pravin Khanorkar	252921073
Aarti Dnyaneshwar Shivde	252921074
Sarthak Harshal More	252921075
Shreenidhi Shekhar Vakilkar	252921076
Reshab Basnet	252921077
Hemant Suresh Rathod	252921079
Shruti Kalidas Bhilare	252921080
Pritesh Pradip Kheto	252921081
Shivam Govind Survase	252921082
Askani Sidhartha	252921083
Prithviraj Devendra Ranaware	252921084
Ved Manohar Patil	252921085
Pruthwin T N	252921086
Sakthi Vignesh Natarajan	252921087
Ved Navakulla	252921088
Koka Trishaal Vignesh	252921089
Kalpesh Shashikant Bauskar	252921090
Macha Sanjana	252921091
Ruthwik Reddy Poreddy	252921092
Sathwik Pottigari	252921093
Harsh Abasaheb Nimbalkar	252921094
Pranav Sewkram Thakur	252921095
Om Rajesh Margur	252921096
Aditya Deepak Biradar	252921097
Chetan Gajanan Patil	252921098
Yashraj Vijay Patil	252921099
Shaik Sumaya Tabassum	252921100
Surajsing Pruthviraj Patil	252921101
Pratik Keshav Magar	252921102
Gudepu Harsha Kumar	252921103
Rohit Somnath Sukre	252921104
Irukulla Nandith Kumar	252921105
Yadnesh Shrikrishana Kadam	252921106
Akash Umakant Ramshette	252921107
Shruti Santosh Masal	252921108
Vaishnavi Ashok Chaudhari	252921109
Prem Rajendra Kale	252921110
Harsh Ramchandra Kumbhar	252921111
Utla Dhruva Raj	252921112
Keesari Sanjay Sanjay	252921113
Nishant Vijay Mule	252921114
Sai Akhil Kadali	252921115
Masura Tharak	252921116
Vikranth Sai Varma	252921117
Musku Harini Reddy	252921118
Reddy Charan Kaveri	252921119
Kushal Vr	252921121
Manan Patel	252921122
Rutuja Ravindra Jore	252921123
Dhino Raimond A	252921124
Nikhitha Reddy Pagidala	252921125
Manthan Yallappa Patil	252921126
Bheemireddy Tejeswar Reddy	252921127
Gayatri Vitthal Langar	252921128
Neha Shashidhar Kulli	252921129
Pritesh Bhaiyasaheb Ahire	252921130
Lavin Pattnaik	252921131
Renukaradya M.b	252921132
Viighnesh Naresh Naik	252921133
Jarupula Sravan Kumar	252921134
Pabolla Bhanu Prakash	252921135
S Sai Praneeth Goud	252921136
Kshatriya Bhavani Mokshith Singh	252921137
Aastha Suresh Gawas	252921138
Chinmay Gowda	252921139
Varshith Dornala	252921141
Himavanth Kannoju	252921142
Pranav Gopal Shrikhande	252921143
Mannem Vaishnavi	252921144
Atharva Samindr Padalghare	252921145
Padiri Yaswanth	252921146
Aditya Singh Tomar	252921147
Satej Yogesh Shinde	252921148
Dhanwantari Panda	252921149
Abhinav Kamulugari	252921150
Krushna Jalindar Gadhe	252921151
Munna Sai	252921152
Boya Sethu Ram	252921153
Godaba Dhileep	252921154
Pranav Jayant Joshi	252921155
Indhu Indhu Ramakoti	252921156
Anushka Sharad Deshmukh	252921157
Katika Gaensh	252921158
Sri Charan Goud Thatipamula	252921159
Pruthviraj	252921160
Sai Kiran Kotha	252921161
Itesam Mohammed Anwarul Haque Shaikh	252921162
Bheemasena Kokkiligadda	252921163
Argula Vallab Das	252921164
Shreyas Patil	252921165
Butti Jaydeep Hari	252921166
Akhil Merwade Gopalkrishna	252921167
Bachchu.anil Kumar Reddy	252921168
Sahaj Alatage	252921169
Varun Kumar Reddy	252921170
Sai Dhanush Baddula	252921171
Yuvraj Rajaram Deshmukh	252921172
Oggu Rohith	252921173
Bhagyesh Gokul More	252921174
Prateek Ashok Arote	252921175
Karansing Bharatsing Patil	252921176
Virendra Suresh Vanjare	252921177
Diksha Dnyaneshwar Shivde	252921178
Santhosh Desu	252921179
Harsha Vardhan Javangula	252921180
Komma Arun Yadav	252921181
Sarthak Sanjay Thamke	252921182
Vivek Simha Gampa	252921183
Purna Ambikesh Kathula	252921184
Yogesh Himmatrao Patil	252921185
Harsh Deepak Bhosale	252921186
Boddu Vineeth	252921187
Gagan V	252921188
Rakesh G R	252921189
Rahul Chowdary Ponnam	252921190
Vishnu Teja Dumpa	252921191
Mandli Sai Ram	252921192
Sai Keerthan Medisetty	252921193
Divya Dnyaneshwar Patil	252921194
Sanchita Dhanraj Umare	252921195
Rudra Rajesh Kilche	252921196
Sandan N	252921197
Rajeev Rana	252921198
Manya K Masthe	252921199
Satyam Balaji Sambhale	252921200
Harshavardhan Raj Akurathi	252921201
Swami Rutvik Shivkumar	252921202
Yenugu Navadeep Reddy	252921203
Upputuri Sri Pavan Abhishek	252921204
Saniya Uddhav Jadhav	252921205
Vaishnav Dipak Musmade	252921206
Abhijeet Mukund Diwate	252921207
Santosh Krishna Bhagat	252921208
Rajakumar Appayappa Badiger	252921209
Parmeshwar Baban Misal	252921210
Soham Sadashiv Khandade	252921211
Mahesh Rajesh Yadav	252921212
Ajay Kumar	252921213
Potnuru Yeswanth	252921214
Darshan Subhash Magadum	252921215
Chinta Eswara Naga Srinivas	252921216
Sabbasani Jagadishwar Reddy	252921217
Rahul Baira Yadav	252921219
Swathi Venkata Subramanyam Karinki	252921220
P Aashrith	252921221
Mani Charan Palle	252921222
Akhiranandan Manda	252921223
Rama Suamanth Reddy	252921224
Devalapura Praveenkumar Praveenkumar	252921225
Siddhi Vinayak Pawar	252921226
Prasannakumar Manjunath Araballi	252921227
C R Suchith	252921228
Lajaree Ashish Deoorkar	252921229
Vishnu Goud Ediga	252921230
Shubhangi Mangal Rathod	252921231
Pamarthi Siddhardha Gowda	252921232
Shreyas B Sawakar	252921233
Shankar Prasad Majji	252921234
Murugesha Rao Dv	252921235
Payal Kailas Chaudhari	252921237
Bhanuteja Bhikshapati Gali	252921239
Ghansham Vijay Nalkar	252921240
Kaustubh Nikhil Marathe	252921241
A Ram Prashanth Reddy	252921242
Darshan B	252921243
Brundhan Chittoju	252921244
Mani Santhosh Dongari	252921245
Adepu Nishanth	252921246
Thota Akshitha	252921247
Aditya Nitin Chavan	252921248
Hemanth Munnaluri	252921249
Vishwajeet Vinay Zambare	252921250
Prabhu Sashank Reddy Billipalli	252921251
P Sai Hemanth	252921252
Sai Tharun Gummula	252921253
Subramaniam Bala Abhishek	252921254
Kalla Hemanth	252921255
Boddu Anilkumar	252921256
Shraddha Gangadhar Kalambe	252921257
Vinayaka Tilak Ps	252921258
Bandi Ram Charan Raj	252921259
Sandesh Sambhaji Kadam	252921260
Somulapalli Greeshmanth	252921261
Nellutla Koushik	252921262
Akarsh B	252921264
Vinay Vinay Jangiti	252921265
Kataru Muni Joshika	252921266
Nidhish Kumar Chamala	252921267
Nagarjun Bg	252921268
Manimi Mohit	252921269
Nallaballe Venkata Tejas	252921270
Venkata Naga Pavani Gangisetti	252921271
Pavan Venkata Naga Gangisetti	252921272
Sagili Sri Manogna Reddy	252921273
Rajahmed Noorahmed Kalal	252921274
Tarun D Hullur	252921275
Kothpelly Mahidhar	252921276
Neelambika Sharanappa Angadi	252921277
Police Sriteja Vardhan Reddy	252921278
Dakarapu Hansika	252921279
C B Harshavardhan	252921280
Vinay Dattatray Kale	252921281
Sanjana Sanjana Kalappa	252921282
Kunapu Ramana Babu	252921284
Vidhya Lakshmi.p	252921286
Tanishq Kishor Dhotre	252921287
Padala Bhargav	252921288
Suresh Gaganam	252921289
Y Ram Charan Gopal Reddy	252921290
Manoj P S	252921291
Rudnure Om Santosh	252921292
Prajwalkumar J	252921293
Thilak R	252921294
Ganesh Boddupalli	252921295
Tejas Patel	252921296
Charan Deep Mutthuluru	252921297
Somya Shambhunath Mishra	252921298
Aaditya Sandeep Parkar	252921299
Rithvik Reddy Nagireddy	252921300
Rohan Annasaheb Kakde	252921301
Haribabu Karre	252921302
Kummari Karthik	252921303
Hemant Yadav Gadudula	252921304
Shaik Shumeer Shaik	252921305
Aldandi Sathvik	252921306
Abhi Ram Yaddanapudi	252921307
Gaddam Yashwanth Reddy	252921308
Mani Kanta K Poojar	252921309
Gopagani Bharath Kishor	252921310
Samiksha Arvind Nevase	252921311
Mohan K	252921312
Dnyaneshwar Ishwar Gurme	252921313
Sandhya Gopal Doke	252921314
Amey Sambhaji Yedage	252921315
Gutti Bhagya Vaishnavi	252921316
Vinayak Bhanudas Kadam	252921317
Mandalemula Venkata Sai Dev Harsh	252921318
Sanskruti Dhanraj Kale	252921319
Sudarshan Sureshrao Bagal	252921320
Alex Sam Cheemakutti	252921321
Yaswanth Ponduri	252921323
Omkar Santosh Narvekar	252921324
Omkar Rangnath Rakhonde	252921325
Juned K	252921326
Sruthi Goulikar	252921327
Pinreddy Chandana Reddy	252921329
Radarapu Sainath	252921331
Kushal Ravi Kagadal	252921332
Satej Subhash kumbhar	252921333
Shambhavi Dinesh Pardeshi	252921334
Praveen Manjerao Ingle	252921335
Ganesh Kumar Reddy Belum	252921336
Sahil Hiraman Deore	252921338
Koushik Telu	252921339
Pooja Viramsing Rajpurohit	252921340
Shivendra Deepak Bhosale	252921341
Sanjeev Kumar Vinukonda	252921342
Dandagala Madhu Chaitanya	252921343
Mudadla Sai	252921344
Sai Suhas Yamsani	252921345
Tanishka Hanumant Zagade	252921346
Ajay Surya Chowdary Donelli	252921347
dhananjay gajanan mali	252921348
Akshad Murlidhar Yede	252921349
Shrutika Suresh Khot	252921350
Gutti Venkata Vardhan Reddy	252921351
Gowtham Kucharlapati	252921352
Sai Ravindra Mahajan	252921353
Jui Narendra Nagane	252921354
Neelakash Kalvacharla	252921355
Bharat Uddhao Gedam	252921356
Bharath Kumar Konety	252921357
Pranay Pravin Kalbhor	252921358
Yashraj Nitin Lomte	252921359
Bharat Premaram Prajapat	252921360
Prem Kasabe	252921361
Soham Kishor Zade	252921362
Rudraksh Nityanand Swami	252921363
Siddhartha Reddy Mamidi	252921364
Hethvi Kasala	252921365
Devarapalli Jashwanth Reddy	252921366
Karati Suresh	252921367
Maddi Hashritha	252921368
Vedangi Mahadev Jagtap	252921369
Yugank Noubade	252921370
prithviraj Anand Bhuse	252921371
Revanth Sri Charan Gandham	252921372
Ritika Prakash Dhupe	252921373
Priyansh Dewan	252921374
Preetham Preetham Bolloju	252921375
Shaikh Mohamadzaid Waheedahmad	252921376
Jnanadeep Yerra	252921377
Aayush Niranjan Patil	252921378
shrutika hanumant yewale	252921379
Sricharan Goud Kondurgu	252921380
Swapnil Harishchandra Shankare	252921381
Raghavendra Ramkrishna Gannamani	252921382
Sharon Nagadasari	252921383
Venkateswara Reddy Veduru	252921384
kanishka manohar chugadiya Manohar Chugadiya	252921385
D S V Chandan Kumar	252921386
Malle Hemanth	252921387
Avula Sai Gowreesh	252921388
Aditya Dnyaneshwar Dalavi	252921389
Sujal Sachin Kodge	252921390
Yashashvee Devidas Kapare	252921391
Navale Om Appasaheb	252921392
Appidi Chethan Kumar Reddy	252921393
Pragna Sai Manchikatla	252921394
Aary Milind Jagtap	252921395
Namrata Laxman Mate	252921396
Rushikesh Gopal Aken	252921397
Khushi Vishwakarma	252921398
Amey Dinkar Patil	252921399
Komal	252921400
Rehan Najir Sanadi	252921401
Dhanesh Ramesh Shetty	252921402
Dantala Harsha Vardhan	252921403
Shruti Kamlesh Chavan	252921404
Harshvardhan Anand More	252921405
Om Badrinath Takle	252921406
Sravya Majji	252921407
Omkar Gajanan Rajure	252921408
Kanneti Vishnu vardhan Reddy	252921409
Omkar Vittal Kamate	252921411
Ramoji Purna Siva Sathvik Achari	252921412
Krish Kumar	252921413
Avishkar Baliram Tompe	252921414
Shambhu Sadashiv Digrase	252921415
Om Ajinath Khade	252921416
Shaikh Taufiq Shaikh Afzal	252921417
Dnyaneshwar Nagorao Bagal	252921418
Yash Madhukar Sonawane	252921419
Varsani Harsh Hiteshbhai	252921420
Aboli Ashok Patil	252921421
Yash Babasaheb Jadhav	252921422
Abhay Dattatray Devalkar	252921423
Vishnu Maroti Shindkar	252921424
Dasari Aswan Kumar	252921425
Nelaturu Vishnu Vardhan	252921426
Imam Hussain Shaik	252921427
Boddu Shiva Kumar	252921428
Korra Teja	252921429
Pritam Anil Patil	252921430
Shrawani Sanjay Satpute	252921431
Patlolla Sai Krishna Reddy	252921432
Jiya Anwar Babude	252921433
Y Prashanth 	252921434
Hitesh Jalagari	252921435
Prashant Kumar Singh	252921436
`;

const seedStudents = async () => {
  console.log('🌱 Seeding students...');
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const lines = studentData.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const usersToInsert = [];

    for (const line of lines) {
      // Split by tab or multiple spaces
      const parts = line.split(/\t+|\s{2,}/);
      if (parts.length < 2) continue; // Skip malformed lines

      const studentName = parts[0].trim();
      const rawPrn = parts[1].trim();
      const prn = `${rawPrn}@sguk.ac.in`;

      usersToInsert.push({
        studentName,
        prn,
        role: 'student',
        department: 'General',
        academicYear: '2025',
        isActive: true
      });
    }

    console.log(`Prepared ${usersToInsert.length} students for insertion.`);

    // We can do bulk upsert to avoid duplicate key errors
    const bulkOps = usersToInsert.map(user => ({
      updateOne: {
        filter: { prn: user.prn },
        update: { $set: user },
        upsert: true
      }
    }));

    if (bulkOps.length > 0) {
      const result = await StudentData.bulkWrite(bulkOps);
      console.log(`✅ Seeded students successfully! Upserted/Modified: ${result.upsertedCount + result.modifiedCount}`);
    } else {
      console.log('No valid students found in the data.');
    }
  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seedStudents();
