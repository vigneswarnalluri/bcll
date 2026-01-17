import React, { useState, useEffect, useRef } from 'react';
import {
    HiOutlineShieldCheck,
    HiOutlineDesktopComputer,
    HiOutlineLightBulb,
    HiOutlineAcademicCap,
    HiOutlineOfficeBuilding,
    HiOutlineBriefcase,
    HiOutlineUserGroup,
    HiOutlineArrowNarrowRight,
    HiOutlineClipboardCheck,
    HiOutlineCloud,
    HiOutlineDeviceMobile,
    HiOutlinePresentationChartLine,
    HiOutlineChatAlt2,
    HiOutlineBadgeCheck
} from 'react-icons/hi';
import './Fellowship.css';
import { supabase } from '../lib/supabase';

// Import Assets
import heroImg from '../assets/viksit_bharat_fellowship_hero_1768564664062.png';
import quantumImg from '../assets/quantum_computing_track_1768564684280.png';
import cloudImg from '../assets/cloud_computing_track_1768564703263.png';
import mobileImg from '../assets/mobile_app_dev_track_1768564724458.png';

const colleges = [...new Set([
    "A V S Engineering College",
    "A.C. College Of Engineering And Technology (Autonomous)",
    "A.M. Reddy Memorial College of Engineering & Technology",
    "A.M.R Institute of Technology",
    "A.P. College of Engineering",
    "A.S.L. Pauls College of Engineering and Technology",
    "ABSS Institute of Technology",
    "AC College of Engineering & Technology",
    "Adarsh College of Engineering",
    "Adarsha College of Engineering",
    "Aditya College of Engineering",
    "Aditya College of Engineering and Technology",
    "Aditya College of Pharmacy",
    "Aditya Engineering College",
    "Aditya Institute of Technology and Management",
    "Aditya Pharmacy College",
    "Aditya University (Engineering)",
    "AIM College of Engineering",
    "AITS",
    "AKRG College of Engineering & Technology",
    "AKRG Engineering College",
    "Al Ameer College of Engineering & IT",
    "Amalapuram Institute of Management Sciences and College of Engineering",
    "AMR Institute of Technology",
    "Amrita Sai Institute of Science & Technology",
    "Amrita University (Engineering)",
    "Anantha Lakshmi Institute of Technology & Sciences",
    "Annamacharya Institute of Technology & Sciences",
    "Anurag Engineering College",
    "Anurag Group of Institutions",
    "Anurag Pharmacy College",
    "Anurag University",
    "Apollo Engineering College",
    "Apollo Institute of Engineering and Technology",
    "Apollo Pharmacy College",
    "Apollo University (Engineering)",
    "Aravind Institute of Technology",
    "Arjun College of Technology",
    "Arjun Engineering College",
    "Aruna Institute of Engineering & Technology",
    "Aryabhata Institute of Technology & Science",
    "ASR College of Engineering",
    "AVANTHI Institute of Engineering & Technology",
    "AVANTHI St Theresa Institute of Engineering & Technology",
    "AVS College of Engineering & Technology",
    "Avanthi College of Engineering",
    "Avanthi Institute of Engineering & Technology",
    "Ayyappa Institute of Engineering",
    "B V Raju Institute of Technology",
    "Baba Institute of Technology & Sciences",
    "Balaji Institute of Technology",
    "Bapatla Engineering College",
    "Bapatla Pharmacy College",
    "Bheema Institute of Technology & Science",
    "Bonam Venkata Chalamayya Engineering College",
    "Bonam Venkata Chalamayya Pharmacy College",
    "BVC Engineering College",
    "BVRIT Hyderabad College of Engineering for Women",
    "C R Reddy College of Engineering",
    "Chaitanya Bharathi Institute of Technology",
    "Chaitanya Institute of Engineering & Technology",
    "Chalapathi Institute of Engineering & Technology",
    "Chirala Engineering College",
    "Chiranjeevi Reddy Institute of Engineering & Technology",
    "CMR College of Engineering & Technology",
    "CMR Institute of Technology",
    "CMR University",
    "CSI Institute of Technology",
    "Dadi Institute of Engineering & Technology",
    "Dhanekula Institute of Engineering & Technology",
    "Dhanvantari Institute of Pharmaceutical Sciences",
    "DRK Institute of Engineering and Technology",
    "Dr Lankapalli Bullayya Engineering College",
    "Dr NTR Institute of Technology",
    "Dr Samuel George Institute of Engineering & Technology",
    "Dr SGIT",
    "Eswar College of Engineering",
    "Fortune Institute of Technology",
    "Gayatri Vidya Parishad College of Engineering",
    "GIET Engineering College",
    "GIET University",
    "GMR Institute of Technology",
    "Gokaraju Rangaraju Institute of Engineering & Technology",
    "Gokula Krishna College of Engineering",
    "Gouthami Institute of Technology",
    "Gowthami Engineering College",
    "GPREC",
    "Gudlavalleru Engineering College",
    "Guntur Engineering College",
    "GVR&S College of Engineering & Technology",
    "Hillgrove College of Engineering",
    "Helapuri Institute of Technology & Science",
    "Hindu College of Engineering",
    "HITS",
    "Ideal Institute of Technology",
    "Ibrahimpatnam Engineering College",
    "Indira Institute of Technology & Science",
    "Injambakkam Engineering College",
    "Institute of Aeronautical Engineering",
    "Invertis Institute of Technology",
    "International School of Technology & Science",
    "J B Institute of Engineering & Technology",
    "J N T University College of Engineering",
    "Jai Bharath College of Engineering",
    "Jai Institute of Engineering",
    "Jawaharlal Nehru Technological University College of Engineering Anantapur",
    "JNTUA College of Engineering Kalikiri",
    "JNTUA College of Engineering Pulivendula",
    "JNTUK College of Engineering Kakinada",
    "JNTUK University College of Engineering Vizianagaram",
    "JNTUK-UCEV",
    "JNTUH College of Engineering Hyderabad",
    "JNTUH University College",
    "JNTU-GV",
    "JNTU-K",
    "JNTU-UCE",
    "Jogaiah Institute of Technology & Sciences",
    "Kakinada Institute of Engineering & Technology",
    "Kallam Haranadhareddy Institute of Technology",
    "KKR & KSR Institute of Technology and Sciences",
    "KKR Engineering College",
    "KL University (Engineering)",
    "KL Deemed University",
    "Knowledge Institute of Technology",
    "Kommuri Pratap Reddy Institute of Technology",
    "Koneru Lakshmaiah Education Foundation University",
    "Koneru Lakshmaiah University",
    "Krishna Chaitanya Institute of Technology & Sciences",
    "Krishnaveni Engineering College",
    "Kuppam Engineering College",
    "Lakireddy Balireddy College of Engineering",
    "Lenora College of Engineering",
    "Lendi Institute of Engineering & Technology",
    "Loyola Institute of Technology",
    "Madanapalle Institute of Technology & Science",
    "Madina Engineering College",
    "Malineni Lakshmaiah College of Engineering",
    "Malineni Lakshmaiah Engineering College",
    "Malineni Lakshmaiah Pharmacy College",
    "Malineni Lakshmaiah Women's Engineering College",
    "Mallareddy College of Engineering",
    "Mallareddy Engineering College",
    "Maris Stella Engineering College",
    "Medha Engineering College",
    "Miracle Educational Society Group of Institutions",
    "MJR College of Engineering & Technology",
    "ML College of Engineering",
    "Mother Teresa College of Engineering",
    "MPES Engineering College",
    "MVR College of Engineering",
    "Nalanda Institute of Engineering & Technology",
    "Narasaraopeta Engineering College",
    "Narsimha Reddy Engineering College",
    "Narayana Engineering College",
    "Narayana Pharmacy College",
    "Narsaraopeta Institute of Technology",
    "Nehru Institute of Engineering & Technology",
    "Nimra Institute of Engineering & Technology",
    "NIST",
    "NRI Institute of Technology",
    "NRI Engineering College",
    "NRT College of Engineering",
    "Nujiveedu Institute of Technology",
    "Nova College of Engineering",
    "Omega College of Engineering",
    "PACE Institute of Technology & Sciences",
    "Padmasri Dr BV Raju Institute of Technology",
    "Paladugu Parvathi Devi College of Engineering",
    "Parala Maharaja Engineering College",
    "Parasakthi Engineering College",
    "PB Siddhartha College of Engineering",
    "Pragati Engineering College",
    "Priyadarshini Institute of Technology & Science",
    "PVP Siddhartha Institute of Technology",
    "QIS College of Engineering & Technology",
    "R V R & J C College of Engineering",
    "Raghu Engineering College",
    "Rajamahendri Institute of Engineering & Technology",
    "Rajeev Gandhi Memorial College of Engineering & Technology",
    "Ramachandra College of Engineering",
    "Ramireddy Subbarami Reddy Engineering College",
    "Ravindra College of Engineering for Women",
    "Rayalaseema University College of Engineering",
    "RGM College of Engineering",
    "Rise Krishna Sai Gandhi Group of Institutions",
    "Rise Institute of Engineering & Technology",
    "S R K Institute of Technology",
    "S R K R Engineering College",
    "Sagi Rama Krishnam Raju Engineering College",
    "Sankethika Vidya Parishad Engineering College",
    "Sasi Institute of Technology & Engineering",
    "Satya Institute of Technology & Management",
    "Satyanarayana Engineering College",
    "Savitha Engineering College",
    "Shri Vishnu Engineering College for Women",
    "Siddhartha Institute of Engineering & Technology",
    "Sir CR Reddy College of Engineering",
    "Sir Vishveshwaraiah Institute of Technology & Science",
    "SITAM",
    "SKR College of Engineering",
    "SLIET",
    "Smt B Seetha Polytechnic & Engineering College",
    "SNIST",
    "SRIT",
    "Srinivasa Institute of Engineering & Technology",
    "Sri Chaitanya Engineering College",
    "Sri Chundi Ranganayakulu Engineering College",
    "Sri Indu Institute of Engineering & Technology",
    "Sri Mittapalli College of Engineering",
    "Sri Sarathi Institute of Engineering & Technology",
    "Sri Venkateswara College of Engineering Tirupati",
    "Sri Venkateswara College of Engineering Kadapa",
    "Sri Venkateswara Engineering College for Women",
    "Sri Venkateswara Institute of Science & Technology",
    "SRK Engineering College",
    "SRKR Engineering College",
    "St Ann’s College of Engineering & Technology",
    "SV Engineering College",
    "SV College of Engineering",
    "Swarnandhra College of Engineering & Technology",
    "Swarnandhra Institute of Engineering & Technology",
    "Tagore Engineering College",
    "Thandra Paparaya Institute of Science & Technology",
    "Thirumala Engineering College",
    "TRR Engineering College",
    "UBDT Engineering College",
    "Usha Rama College of Engineering & Technology",
    "V R Siddhartha Engineering College",
    "VAJR Institute of Technology",
    "Vasireddy Venkatadri Institute of Technology",
    "VEMU Institute of Technology",
    "Venkateswara Engineering College",
    "Vikas College of Engineering",
    "VIKAS Engineering College",
    "Vishnu Institute of Technology",
    "Vishnu Pharmacy College",
    "Visvodaya Engineering College",
    "VIT-AP University",
    "VNR Vignana Jyothi Institute of Engineering & Technology",
    "VR Siddhartha Engineering College",
    "VRS & YRN College of Engineering & Technology",
    "VVIT",
    "YGVU Engineering College",
    "YITS",
    "Aditya University",
    "Acharya Nagarjuna University College of Engineering",
    "ACE Engineering College",
    "Acharaya Institute of Technology",
    "Anantha Lakshmi Engineering College",
    "Annamacharya Engineering College",
    "Arjun Engineering Institute",
    "ASTRA Engineering College",
    "Aurora Engineering College",
    "Bharat Institute of Engineering & Technology",
    "Bheema Engineering College",
    "Brindavan Institute of Technology",
    "Chadalawada Ramanamma Engineering College",
    "Chaitanya Engineering College",
    "Chaitanya Institute of Science & Technology",
    "Chaitanya University",
    "Crescent Engineering College",
    "DVR & Dr HS MIC College of Technology",
    "DVR Engineering College",
    "Dr Paul Raj Engineering College",
    "Eswar Engineering College",
    "Geetanjali Institute of Science & Technology",
    "GITAM University (Engineering)",
    "Gokulakrishna Engineering College",
    "Gowtham Engineering Institute",
    "Guntur Engineering Institute",
    "GVR Institute of Technology",
    "Hindu Institute of Technology",
    "Hyderabad Institute of Technology & Management",
    "Ibrahim Engineering College",
    "Indo American Institute of Technology",
    "Jagruti Institute of Engineering",
    "Jaya Engineering College",
    "Jayamukhi Institute of Technological Sciences",
    "JNTU-GV College of Engineering Narasaraopet",
    "JNTUK-UCE Vizianagaram",
    "JNTUH Sultanpur",
    "KSRM College of Engineering",
    "Kakinada Institute of Technology Sciences",
    "Kandula Lakshumma Memorial College of Engineering for Women",
    "KBN College of Engineering",
    "Khammam Institute of Technology & Sciences",
    "KITS Ramachandrapuram",
    "KK Engineering College",
    "KL Engineering College",
    "Kodada Institute of Technology & Science for Women",
    "Koneru Lakshmaiah Engineering College",
    "Kottam College of Engineering",
    "Kuppam College of Engineering",
    "Lakkireddy Balireddy Engineering College",
    "Lenora Institute of Engineering",
    "Madanapalle Engineering College",
    "Mahaveer Institute of Science & Technology",
    "Malla Reddy Engineering College for Women",
    "Mandava Institute of Engineering & Technology",
    "Marri Laxman Reddy Institute of Technology",
    "MITS",
    "MLR Institute of Technology",
    "MPR Engineering College",
    "Nalanda College of Engineering",
    "Nalla Narasimha Reddy Engineering College",
    "Narsimha Reddy Engineering Institute",
    "National Institute of Technology AP (NIT AP)",
    "Nava Bharathi Institute of Technology",
    "Nehru Institute of Engineering",
    "Nimra Engineering College",
    "NIST University",
    "NIT Andhra Pradesh",
    "Nova Engineering College",
    "PACET",
    "Padmasri Institute of Technology",
    "Paladugu Parvathi Devi Engineering Institute",
    "Parvathaneni Brahmayya Siddhartha Engineering College",
    "PBR Visvodaya Institute of Technology & Science",
    "Prakasam Engineering College",
    "Prasad V Potluri Siddhartha Institute of Technology",
    "Priyadarshini Engineering College",
    "PVP Siddhartha Engineering College",
    "QIS Engineering College",
    "Raghu Institute of Technology",
    "Rajeev Gandhi Engineering College",
    "Rajiv Gandhi Institute of Technology",
    "Rao & Naidu Engineering College",
    "Ravindra Institute of Technology",
    "Rayalaseema College of Engineering",
    "Rise Krishna Sai Engineering College",
    "RK Engineering College",
    "RVR Engineering College",
    "S R Engineering College",
    "S R Institute of Technology",
    "S.V. University College of Engineering",
    "Sagi Rama Krishnam Raju Institute of Technology",
    "Sai Ganapathi Engineering College",
    "Sai Institute of Technology & Science",
    "Sanketika Engineering College",
    "Sasi Institute of Engineering",
    "Satya Institute of Engineering & Technology",
    "Siddaganga College of Technology AP Campus",
    "Siddhartha Engineering College",
    "Simhadri Engineering College",
    "Sir CR Reddy University (Engineering)",
    "SITAMS",
    "SKBR Engineering College",
    "SLN College of Engineering",
    "SN Engineering College",
    "Sree Rama Engineering College",
    "Sree Sastha Institute of Engineering",
    "Sree Vahini Institute of Science & Technology",
    "Sri Aditya Engineering College",
    "Sri Balaji University (Engineering)",
    "Sri Bharathi Engineering College",
    "Sri Chaitanya Institute of Engineering",
    "Sri College of Engineering",
    "Sri Datta Institute of Engineering",
    "Sri Indu College of Engineering",
    "Sri Institute of Technology",
    "Sri Kalahasteeswara Institute of Technology",
    "Sri Krishnadevaraya Engineering College",
    "Sri Mittapalli Institute of Technology",
    "Sri Prakash College of Engineering",
    "Sri Sai Madhavi Institute of Science & Technology",
    "Sri Sarada Institute of Technology",
    "Sri Satyanarayan Engineering College",
    "Sri Siddhartha Engineering College",
    "Sri Sivani Institute of Technology",
    "Sri Vasavi Engineering College",
    "SRM University AP",
    "SSN Engineering College",
    "St Ann’s Engineering Institute",
    "St Johns College of Engineering",
    "St Mary’s Engineering College",
    "SV University Engineering College",
    "SVCN Engineering College",
    "SVR Engineering College",
    "Swarnandhra Engineering Institute",
    "Syed Ammal Engineering College (AP Campus)",
    "Tagore Institute of Technology",
    "TKR College of Engineering",
    "Tollywood Engineering College (Fictionally Named in PDF)",
    "TRR Institute of Technology",
    "Udaya Engineering College",
    "Universal Engineering College",
    "Usha Rama Engineering Institute",
    "Vardhaman College of Engineering",
    "Vasavi Engineering College",
    "VEMU Engineering Institute",
    "Venkatadri Engineering College",
    "Vidya Jyothi Institute of Technology",
    "Vignan Institute of Engineering for Women",
    "Vignan Institute of Information Technology",
    "Vignan Pharmacy College",
    "Vignan University (Engineering)",
    "Vikas Group of Institutions",
    "Vikas Institute of Science & Technology",
    "VITS",
    "Vivekananda Institute of Technology & Science",
    "VNR Engineering Institute",
    "VRS Engineering College",
    "VVIT Engineering Institute",
    "Yaswanth Engineering College",
    "YITS Engineering College",
    "Yogi Vemana University College of Engineering",
    "Aditya Global Business School – Engineering Wing",
    "Aims Institute of Technology",
    "Akhil Bharatiya Engineering College",
    "Amara Institute of Technology",
    "Aravind Engineering College",
    "Archarya Engineering Institute",
    "ASLP Engineering College",
    "AVN Institute of Engineering & Technology",
    "Balaji Institute of Science & Technology",
    "Bhagavan Engineering College",
    "Blooming Engineering College",
    "BlueCrest Engineering College",
    "Brilliant Institute of Engineering & Technology",
    "CMT Engineering Institute",
    "CSM Institute of Technology",
    "Damodaram Sanjivayya National Law University (Tech Wing)",
    "Devineni Venkata Ramana Institute of Engineering",
    "Dhamapuri Srinivasa Reddy Engineering College",
    "Dr KV Subba Reddy Institute of Technology",
    "Dr KVSR Engineering Institute",
    "Dr L Bullayya Engineering Institute",
    "Dr YCR Engineering College",
    "Eluru College of Engineering",
    "Excel Engineering College",
    "Federal Institute of Science & Technology",
    "Geethanjali Engineering Institute",
    "GMR Polytechnic & Engineering Wing",
    "Godavari Institute of Engineering & Technology (Additional Campus)",
    "Gokula Krishna Engineering Institute",
    "Gowtham Engineering Arts & Science Campus",
    "Greentech Engineering College",
    "Guru Nanak Engineering College",
    "Guru Raghavendra Institute of Technology",
    "Hamsaveni Engineering Institute",
    "Hindu Engineering Institute",
    "HITECH Engineering College",
    "HITS Engineering Wing",
    "IFHE (Engineering Campus)",
    "IITDM Kurnool",
    "Jagan’s Engineering College",
    "Jain Engineering Institute",
    "JITS Engineering College",
    "JNTUA School of Engineering",
    "JNTUK School of Engineering",
    "JNTUH School of Engineering",
    "Jyothi Engineering College",
    "Kakinada School of Engineering",
    "Kala Ashram Engineering Institute",
    "Kandula Lakshumaiah Engineering Institute",
    "KGR Institute of Technology",
    "Kings Engineering College",
    "Kodada Engineering Institute",
    "Koneru Institute of Technology",
    "Krishna Engineering Institute",
    "Kuppam School of Engineering",
    "Lakshmi Engineering College",
    "Little Flower Engineering Institute",
    "Loyola Engineering Campus",
    "Madhira Institute of Technology",
    "Mahathi Engineering College",
    "Maheshwara Institute of Technology",
    "Malineni Lakshmaiah School of Engineering",
    "Malla Reddy Engineering Institute",
    "Maris Stella Engineering Institute",
    "Matrix School of Engineering",
    "MITS Engineering Wing",
    "MNR Engineering College",
    "Modugula Engineering Institute",
    "Mother Teresa Engineering Institute",
    "MSC Engineering College",
    "MVR Engineering Institute",
    "Nalanda School of Engineering",
    "Nandyal Institute of Engineering & Technology",
    "Narasaraopeta School of Engineering",
    "Narsimha Reddy School of Engineering",
    "Nellore Engineering Institute",
    "NIST School of Technology",
    "NRI School of Engineering",
    "Omega School of Engineering",
    "Osmania Engineering Institute",
    "PACE School of Engineering",
    "Padala Rama Reddy Engineering College",
    "Parasakti School of Engineering",
    "PBR Engineering Institute",
    "Pragathi Engineering Institute",
    "Prakasam School of Engineering",
    "Prasad Engineering Institute",
    "Priyadarshini School of Engineering",
    "PVP Engineering Institute",
    "QIS School of Engineering",
    "Rajahmundry School of Engineering",
    "Ramachandra School of Engineering",
    "Rayalaseema School of Engineering",
    "Rise School of Engineering",
    "RVR School of Engineering",
    "S R School of Engineering",
    "Sagi Rama Krishnam Raju School of Engineering",
    "Sai Madhavi Engineering Institute",
    "Sankar School of Engineering",
    "Sasi School of Engineering",
    "Satya School of Engineering",
    "SBC Engineering Institute",
    "Seshadri Rao Gudlavalleru Engineering Institute (Alternate Name)",
    "Shri Vishnu Engineering Institute",
    "Siddhartha Engineering Institute",
    "Simhadri School of Engineering",
    "SIT Engineering Campus",
    "SKR School of Engineering",
    "SLIET Engineering Division",
    "SNIST Engineering School",
    "Southerland Engineering College",
    "Sree College of Engineering",
    "Sree Institute of Technology",
    "Sree Mittapalli Engineering Institute",
    "Sree Rama Engineering Institute",
    "Sree Sastha Engineering Institute",
    "Sree Vahini Engineering Institute",
    "Sri Aditya School of Engineering",
    "Sri Chaithanya School of Engineering",
    "Sri Datta Engineering Institute",
    "Sri Indu Engineering Institute",
    "Sri Kalahasti Engineering Institute",
    "Sri Krishna Engineering Institute",
    "Sri Prakash Engineering Institute",
    "Sri PSV Engineering Campus",
    "Sri Sarathi Engineering Institute",
    "Sri Siddhartha School of Engineering",
    "Sri Sivani Engineering Institute",
    "Sri Vasavi School of Engineering",
    "Srinivasa Engineering Institute",
    "SR Engineering Institute",
    "SRKR School of Engineering",
    "St Mary’s Engineering Institute",
    "St Theresa Engineering College",
    "Sunflower Engineering Institute",
    "SV Engineering Institute",
    "SVR School of Engineering",
    "Swarnandhra School of Engineering",
    "Syed Ammal School of Engineering",
    "Tagore School of Technology",
    "Teegala Krishna Reddy School of Engineering",
    "Tollywood Institute of Technology",
    "Trinity Engineering Institute",
    "Udaya School of Engineering",
    "Universal School of Engineering",
    "Usha Rama School of Engineering",
    "Vaagdevi Engineering Institute",
    "Vagdevi Engineering College",
    "Vardhaman School of Engineering",
    "Vaishnavi Engineering Institute",
    "Vasavi School of Engineering",
    "VEMU School of Engineering",
    "Venkateswara School of Engineering",
    "Vidya Jyothi School of Engineering",
    "Vignan School of Engineering",
    "Vijay Engineering Institute",
    "VIKAS School of Engineering",
    "Vishnu School of Engineering",
    "Viswanadha Engineering Institute",
    "VNR School of Engineering",
    "VRS School of Engineering",
    "VVIT School of Engineering",
    "Yalamarty Engineering College",
    "YITS School of Engineering",
    "Yogi Vemana School of Engineering"
])].sort();


const Fellowship = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [formStep, setFormStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        student_name: '',
        aadhaar_no: '',
        dobDay: '',
        dobMonth: '',
        dobYear: '',
        email: '',
        phone: '',
        college_org: '',
        register_id: '',
        year: '',
        program: '',
        acc_holder: '',
        bank_name: '',
        acc_no: '',
        ifsc_code: ''
    });

    const years = Array.from({ length: 47 }, (_, i) => 2012 - i);
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    const [collegeSuggestions] = useState(colleges);
    const [filteredColleges, setFilteredColleges] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const collegeRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (collegeRef.current && !collegeRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Enforce numeric-only for specific fields
        if (['aadhaar_no', 'phone', 'acc_no'].includes(name)) {
            const numericValue = value.replace(/\D/g, ''); // Remove non-digits

            // Apply length limits
            if (name === 'aadhaar_no' && numericValue.length > 12) return;
            if (name === 'phone' && numericValue.length > 10) return;
            if (name === 'acc_no' && numericValue.length > 18) return;

            setFormData(prev => ({ ...prev, [name]: numericValue }));
            return;
        }

        if (name === 'college_org') {
            const filtered = collegeSuggestions.filter(c =>
                c.toLowerCase().includes(value.toLowerCase())
            ).slice(0, 20); // Much smaller slice for better UI space
            setFilteredColleges(filtered);
            setIsDropdownOpen(value.length > 0);
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectCollege = (name) => {
        setFormData(prev => ({ ...prev, college_org: name }));
        setIsDropdownOpen(false);
    };

    const handleNext = (e) => {
        e.preventDefault();
        setFormStep(prev => prev + 1);
    };

    const handleBack = () => {
        setFormStep(prev => prev - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const finalDob = `${formData.dobDay} ${formData.dobMonth}, ${formData.dobYear}`;
            const { error } = await supabase.from('students').insert([{
                student_name: formData.student_name,
                aadhaar_no: formData.aadhaar_no,
                email: formData.email,
                phone: formData.phone,
                dob: finalDob,
                college_org: formData.college_org,
                student_id: String(formData.register_id),
                academic_year: String(formData.year),
                program: formData.program,
                acc_holder: formData.acc_holder,
                bank_name: formData.bank_name,
                acc_no: formData.acc_no,
                ifsc_code: formData.ifsc_code,
                status: 'Active'
            }]);

            if (error) throw error;

            setIsModalOpen(false);
            setIsSubmitted(true);
            setFormStep(1);
            window.scrollTo(0, 0);
        } catch (error) {
            console.error('Submission failed:', error);
            alert('Database Connection Error: Could not save registration. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="fellowship-page">
                <div className="success-overlay">
                    <div className="success-card">
                        <div className="success-icon-circle">✓</div>
                        <h1 className="f-section-title">Submission Confirmed</h1>
                        <p style={{ color: 'var(--f-text-muted)', marginBottom: '32px' }}>
                            Your application for the <strong>Viksit Bharat Fellowship – 2026</strong> has been received by the Academic Review Committee.
                        </p>
                        <button className="f-btn f-btn-primary" onClick={() => setIsSubmitted(false)}>Back to Program Home</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fellowship-page">
            {/* Hero Section */}
            <section className="fellowship-hero">
                <div className="hero-overlay"></div>
                <div className="f-container hero-content">
                    <div className="hero-badge">Official Academic Fellowship – 2026</div>
                    <h1 className="hero-title">Viksit Bharat <br />(Developed India) @ 2047</h1>
                    <p className="hero-subtitle">
                        A flagship digital fellowship designed to empower Computer Science Engineering students in alignment with the national vision and AP Government's P4 Model.
                    </p>
                    <div className="hero-actions">
                        <button className="f-btn f-btn-primary f-lg" onClick={() => setIsModalOpen(true)}>Enroll in Program</button>
                        <a href="#overview" className="f-btn f-btn-outline f-lg">Explore Program</a>
                    </div>
                </div>
            </section>

            {/* 1. Program Overview */}
            <section id="overview" className="f-section overview-section">
                <div className="f-container">
                    <div className="f-two-col-grid">
                        <div className="overview-content-left">
                            <span className="f-section-tag">Program Mission</span>
                            <h2 className="f-section-title">Bridging Academia with Next-Gen Industry</h2>
                            <p style={{ fontSize: '1.125rem', color: 'var(--f-text-muted)', marginBottom: '32px' }}>
                                The <strong>Viksit Bharat Fellowship – 2026</strong> is a future-focused digital program designed exclusively for CSE students. It bridges the gap between academic learning and industry-ready skills by providing structured training in areas aligned with the <strong>Quantum Valley</strong> initiative.
                            </p>
                            <p style={{ color: 'var(--f-text-muted)', marginBottom: '40px' }}>
                                Through expert-led virtual training and hand-on projects, the program empowers students with practical exposure, innovation capabilities, and professional competence, fostering a robust talent pipeline for the digital economy.
                            </p>

                            <div className="highlights-stack">
                                <HighlightItem
                                    icon={<HiOutlineShieldCheck />}
                                    title="P4 Model Alignment"
                                    desc="Collaboratively designed under the Public-Private-People-Partnership framework."
                                />
                                <HighlightItem
                                    icon={<HiOutlineDesktopComputer />}
                                    title="Bridge the Gap"
                                    desc="Transforming academic knowledge into industry-ready technological competence."
                                />
                                <HighlightItem
                                    icon={<HiOutlineUserGroup />}
                                    title="Strategic Sovereignty"
                                    desc="Supporting national development goals and public digital infrastructure."
                                />
                            </div>
                        </div>
                        <div className="overview-visual-right">
                            <div className="image-frame">
                                <img
                                    src={heroImg}
                                    alt="Viksit Bharat Vision"
                                />
                                <div className="floating-stat-box">
                                    <span className="stat-num">2047</span>
                                    <span className="stat-label">National Vision</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="f-section-divider"></div>
            </section>

            {/* 2. Technologies Offered */}
            <section className="f-section f-bg-light">
                <div className="f-container">
                    <div className="f-section-header center">
                        <span className="f-section-tag">Technologies Offered (CSE)</span>
                        <h2 className="f-section-title">High-Demand Specialization Tracks</h2>
                        <p style={{ color: 'var(--f-text-muted)', maxWidth: '800px', margin: '0 auto' }}>Students may specialize in one tracked domain carefully selected to match future industry needs and government technology initiatives.</p>
                        <div className="f-title-divider"></div>
                    </div>

                    <div className="tech-grid">
                        <TrackCard
                            isFeatured
                            badge="Highly Recommended"
                            image={quantumImg}
                            title="A) Quantum Computing"
                            features={['Quantum Fundamentals & Qubits', 'Quantum Algorithms & Circuits', 'Real-world Research Applications']}
                            desc="Directly aligned with the AP Government's Quantum Valley Initiative."
                        />
                        <TrackCard
                            image={cloudImg}
                            title="B) Cloud Computing"
                            features={['Virtualization & Networking', 'DevOps & Scalability', 'Enterprise Cloud Solutions']}
                            desc="Focus on real-world cloud platforms and deployment models."
                        />
                        <TrackCard
                            image={mobileImg}
                            title="C) Mobile Application Development"
                            features={['Modern UI/UX Principles', 'APIs & Database Integration', 'Industry-standard Deployment']}
                            desc="Hands-on experience with modern mobile ecosystem tools."
                        />
                    </div>
                </div>
                <div className="f-section-divider"></div>
            </section>

            {/* Fellowship Structure */}
            <section className="f-section roadmap-section">
                <div className="f-container">
                    <div className="f-section-header center">
                        <span className="f-section-tag">Fellowship Structure & Duration</span>
                        <h2 className="f-section-title">A Step-by-Step Skill Pipeline</h2>
                        <p style={{ color: 'var(--f-text-muted)' }}>Combining theory, practical learning, evaluation, and hands-on exposure.</p>
                        <div className="f-title-divider"></div>
                    </div>

                    <div className="f-roadmap-grid">
                        <RoadmapCard icon={<HiOutlineDesktopComputer />} phase="Basic" title="Course Training" desc="Core fundamentals training in your chosen domain. (15 Days)" />
                        <RoadmapCard icon={<HiOutlineClipboardCheck />} phase="Basic" title="Examination" desc="Online MCQ-based evaluation of core knowledge. (1 Day)" />
                        <RoadmapCard icon={<HiOutlinePresentationChartLine />} phase="Advanced" title="Course Training" desc="Intensive advanced-level concept mastery. (15 Days)" />
                        <RoadmapCard icon={<HiOutlineClipboardCheck />} phase="Advanced" title="Examination" desc="Skill & MCQ-based test to assess professional depth. (1 Day)" />
                        <RoadmapCard icon={<HiOutlineBriefcase />} phase="Practical" title="Projects & Internship" desc="Real-world practical implementation with Stipend. (30 Days)" />
                    </div>
                </div>
                <div className="f-section-divider"></div>
            </section>

            {/* 4 & 5. Methodology & Assessment */}
            <section className="f-section f-bg-light">
                <div className="f-container">
                    <div className="f-two-col-grid">
                        <div className="methodology-box">
                            <span className="f-section-tag">Training Methodology</span>
                            <h2 className="f-section-title">Digital-First Learning</h2>
                            <ul className="f-check-list-modern">
                                <li><HiOutlinePresentationChartLine /> 100% Digital Learning Platform</li>
                                <li><HiOutlineChatAlt2 /> Expert-led Live & Recorded Sessions</li>
                                <li><HiOutlineDesktopComputer /> Hands-on Practical with Real-time Tools</li>
                                <li><HiOutlineClipboardCheck /> Continuous Real-time Assignments</li>
                                <li><HiOutlineBadgeCheck /> Industry-oriented Future Curriculum</li>
                            </ul>
                        </div>
                        <div className="assessment-box" style={{ background: 'white', padding: '50px', borderRadius: '24px', boxShadow: 'var(--f-shadow-premium)' }}>
                            <span className="f-section-tag">Assessment Process</span>
                            <h2 className="f-section-title">Ensuring Excellence</h2>
                            <p style={{ color: 'var(--f-text-muted)', marginBottom: '24px' }}>Multi-layered evaluation to ensure competence and accountability:</p>
                            <div className="assessment-steps">
                                <div className="a-step"><HiOutlineClipboardCheck className="a-icon" /> Mandatory Practical Assignments</div>
                                <div className="a-step"><HiOutlinePresentationChartLine className="a-icon" /> Project-based Performance Evaluation</div>
                                <div className="a-step"><HiOutlineDesktopComputer className="a-icon" /> Online Digital Examination</div>
                            </div>
                            <p style={{ marginTop: '24px', fontSize: '0.875rem', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', color: 'var(--f-success)', fontWeight: 700 }}>
                                * Qualification is mandatory for the Internship & Stipend phase.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="f-section-divider"></div>
            </section>

            {/* 6 & 7. Stipend & Industrial Exposure */}
            <section className="f-section f-bg-dark">
                <div className="f-container">
                    <div className="stipend-executive-wrap">
                        <div className="stipend-content">
                            <span className="f-section-tag" style={{ color: 'var(--f-secondary)' }}>Internship & Stipend</span>
                            <h2 className="f-section-title" style={{ color: 'white' }}>Performance Rewards</h2>
                            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '40px' }}>
                                Designed to motivate consistency, and mastery. Minimum 50% digital class attendance is mandatory for stipend qualification.
                            </p>

                            <div className="stipend-tiers">
                                <div className="tier-row highlighted">
                                    <span className="tier-name">80% & Above Scoring</span>
                                    <span className="tier-amount">₹2,000 <small>/ month</small></span>
                                </div>
                                <div className="tier-row">
                                    <span className="tier-name">70% – 79% Scoring</span>
                                    <span className="tier-amount">₹1,500 <small>/ month</small></span>
                                </div>
                                <div className="tier-row">
                                    <span className="tier-name">50% – 69% Scoring</span>
                                    <span className="tier-amount">₹1,000 <small>/ month</small></span>
                                </div>
                            </div>
                        </div>

                        <div className="industrial-exposure-box">
                            <span className="f-section-tag" style={{ color: 'var(--f-accent)' }}>Industrial Exposure</span>
                            <div className="exposure-header">
                                <HiOutlineOfficeBuilding className="exposure-icon" />
                                <h3 style={{ color: 'white' }}>Free Industrial Visit</h3>
                            </div>
                            <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '32px' }}>Gain insights into industry workflows and professional environments at selected technology facilities.</p>
                            <ul className="exposure-list">
                                <li>Real-world workflow visualization</li>
                                <li>Corporate environment exposure</li>
                                <li>Real-time technology applications</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* 9 & 10. Outcomes & Benefits */}
            <section className="f-section">
                <div className="f-container">
                    <div className="f-section-header center">
                        <span className="f-section-tag">Certification & Outcomes</span>
                        <h2 className="f-section-title">Professional Certification</h2>
                        <div className="f-title-divider"></div>
                    </div>

                    <div className="institutional-grid">
                        <BenefitItem icon={<HiOutlineBadgeCheck />} title="Fellowship Certificate" desc="Viksit Bharat Fellowship Certificate – 2026." />
                        <BenefitItem icon={<HiOutlineBriefcase />} title="Internship Certificate" desc="Official Internship Completion Certificate." />
                        <BenefitItem icon={<HiOutlineDesktopComputer />} title="Hands-on Projects" desc="Real practical experience in advanced tech." />
                        <BenefitItem icon={<HiOutlineBadgeCheck />} title="Digital Skills" desc="Enhanced employability and innovation capacity." />
                    </div>

                    <div style={{ marginTop: '120px' }}>
                        <div className="f-section-header center">
                            <span className="f-section-tag">Benefits to Colleges</span>
                            <h2 className="f-section-title">Institutional Advantages</h2>
                            <div className="f-title-divider"></div>
                        </div>
                        <div className="institutional-grid">
                            <BenefitItem icon={<HiOutlineArrowNarrowRight />} title="Skill Parity" desc="Bridge curriculum gaps with market needs." />
                            <BenefitItem icon={<HiOutlineUserGroup />} title="Govt Alignment" desc="Support state-level digital initiatives like Quantum Valley." />
                            <BenefitItem icon={<HiOutlineLightBulb />} title="Employment" desc="Boost placements via structured certifications." />
                            <BenefitItem icon={<HiOutlineShieldCheck />} title="Recognition" desc="Collaborate with Govt & industry technology boards." />
                        </div>
                    </div>
                </div>
                <div className="f-section-divider"></div>
            </section>

            {/* 11. Alignment with Government Vision */}
            <section className="f-section f-bg-light">
                <div className="f-container">
                    <div className="f-section-header center">
                        <span className="f-section-tag">Alignment with Government Vision</span>
                        <h2 className="f-section-title">Strategic Frameworks</h2>
                        <div className="f-title-divider"></div>
                    </div>
                    <div className="institutional-grid">
                        <BenefitItem icon={<HiOutlineBadgeCheck />} title="Viksit Bharat Mission" desc="Building a skilled, innovation-driven youth workforce." />
                        <BenefitItem icon={<HiOutlineLightBulb />} title="Quantum Valley" desc="Promoting next-gen research and digital leadership." />
                        <BenefitItem icon={<HiOutlineUserGroup />} title="P4 Model" desc="Ensuring collaborative participation (P-P-P-P)." />
                        <BenefitItem icon={<HiOutlineShieldCheck />} title="Digital Inclusion" desc="Technological empowerment across academic ecosystems." />
                    </div>
                </div>
            </section>

            {/* 12. Conclusion & Registration */}
            <section className="f-section">
                <div className="f-container">
                    <div className="conclusion-block" style={{ textAlign: 'center', marginBottom: '80px', maxWidth: '900px', margin: '0 auto 80px' }}>
                        <span className="f-section-tag">Conclusion</span>
                        <h2 className="f-section-title">Equip Yourself for the Future</h2>
                        <p style={{ fontSize: '1.125rem', color: 'var(--f-text-muted)' }}>
                            The <strong>Viksit Bharat Fellowship – 2026</strong> is a high-impact program designed to equip students with future-ready skills, hands-on exposure, and financial support, contributing to nation-building and India's long-term development goals.
                        </p>
                    </div>

                    <div className="premium-cta-card">
                        <div className="cta-info">
                            <span style={{ fontSize: '0.875rem', fontWeight: 800, textTransform: 'uppercase', opacity: 0.8 }}>Registration Portal</span>
                            <h2>Apply for the 2026 Fellowship</h2>
                            <p>Registration Fee: ₹500 (Includes platform access, complete digital materials, assignments & certification)</p>
                        </div>
                        <div className="cta-actions">
                            <button className="f-btn-premium" onClick={() => setIsModalOpen(true)}>
                                Enroll Now <HiOutlineArrowNarrowRight />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => { setIsModalOpen(false); setFormStep(1); }}>
                    <div className="modal-container" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h2>Fellowship Application</h2>
                                <div className="step-dots">
                                    <span className={formStep >= 1 ? 'active' : ''}></span>
                                    <span className={formStep >= 2 ? 'active' : ''}></span>
                                    <span className={formStep >= 3 ? 'active' : ''}></span>
                                </div>
                            </div>
                            <button className="close-btn" onClick={() => { setIsModalOpen(false); setFormStep(1); }}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <form className="formal-form" onSubmit={formStep === 3 ? handleSubmit : handleNext}>
                                {formStep === 1 && (
                                    <div className="form-grid-section animate-slide">
                                        <h4 className="form-sub-header">Student Identification</h4>
                                        <div className="form-row-2">
                                            <div className="form-group"><label>Name (on Aadhaar)</label><input type="text" name="student_name" value={formData.student_name} onChange={handleChange} required placeholder="Enter Full Name" /></div>
                                            <div className="form-group"><label>Aadhaar No</label><input type="text" name="aadhaar_no" value={formData.aadhaar_no} onChange={handleChange} required placeholder="12 Digit Number" inputMode="numeric" pattern="[0-9]{12}" maxLength="12" /></div>
                                        </div>
                                        <div className="form-group" style={{ marginBottom: '12px' }}>
                                            <label>Date of Birth</label>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '8px' }}>
                                                <select name="dobDay" value={formData.dobDay} onChange={handleChange} required>
                                                    <option value="">Day</option>
                                                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                                                </select>
                                                <select name="dobMonth" value={formData.dobMonth} onChange={handleChange} required>
                                                    <option value="">Month</option>
                                                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                                                </select>
                                                <select name="dobYear" value={formData.dobYear} onChange={handleChange} required>
                                                    <option value="">Year</option>
                                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="form-group"><label>Personal Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="example@domain.com" pattern="[^@\s]+@[^@\s]+\.[^@\s]+" title="Please enter a valid email address (e.g., name@domain.com)" /></div>
                                        <div className="form-row-1">
                                            <div className="form-group"><label>Contact No</label><input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="10 Digit Mobile No" inputMode="tel" pattern="[0-9]{10}" maxLength="10" /></div>
                                        </div>
                                    </div>
                                )}

                                {formStep === 2 && (
                                    <div className="form-grid-section animate-slide">
                                        <h4 className="form-sub-header">Academic Details</h4>
                                        <div className="form-row-1">
                                            <div className="form-group" style={{ position: 'relative' }} ref={collegeRef}>
                                                <label>College Name</label>
                                                <input
                                                    type="text"
                                                    name="college_org"
                                                    value={formData.college_org}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="Search or Type Your College Name"
                                                    autoComplete="off"
                                                    style={isDropdownOpen && filteredColleges.length > 0 ? {
                                                        borderRadius: '12px 12px 0 0',
                                                        borderBottomColor: 'transparent'
                                                    } : {}}
                                                />

                                                {isDropdownOpen && filteredColleges.length > 0 && (
                                                    <div className="custom-autocomplete-dropdown">
                                                        {filteredColleges.slice(0, 20).map((name, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="autocomplete-item"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleSelectCollege(name);
                                                                }}
                                                            >
                                                                {name}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <small style={{ display: 'block', marginTop: '4px', opacity: 0.7, fontSize: '0.75rem' }}>
                                                    * If your college is not in the list, please type it manually.
                                                </small>
                                            </div>
                                        </div>
                                        <div className="form-row-2">
                                            <div className="form-group"><label>Register ID / Roll No</label><input type="text" name="register_id" value={formData.register_id} onChange={handleChange} required placeholder="e.g. 21BCS101" /></div>
                                            <div className="form-group">
                                                <label>Current Year</label>
                                                <select name="year" value={formData.year} onChange={handleChange} required>
                                                    <option value="">Select Year</option>
                                                    <option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="form-row-1">
                                            <div className="form-group">
                                                <label>Domain Specialization</label>
                                                <select name="program" value={formData.program} onChange={handleChange} required>
                                                    <option value="">Select Track</option>
                                                    <option>Quantum Computing</option><option>Cloud Computing</option><option>Mobile App Dev</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {formStep === 3 && (
                                    <div className="form-grid-section animate-slide">
                                        <h4 className="form-sub-header">Bank Disbursement Info</h4>
                                        <div className="form-row-2">
                                            <div className="form-group"><label>Account Holder Name</label><input type="text" name="acc_holder" value={formData.acc_holder} onChange={handleChange} required placeholder="Name on Passbook" /></div>
                                            <div className="form-group"><label>Bank Name</label><input type="text" name="bank_name" value={formData.bank_name} onChange={handleChange} required placeholder="Bank Branch Name" /></div>
                                        </div>
                                        <div className="form-row-2">
                                            <div className="form-group"><label>Account No</label><input type="text" name="acc_no" value={formData.acc_no} onChange={handleChange} required inputMode="numeric" pattern="[0-9]*" placeholder="11-16 Digit No" /></div>
                                            <div className="form-group"><label>IFSC Code</label><input type="text" name="ifsc_code" value={formData.ifsc_code} onChange={handleChange} required placeholder="SBIN0001234" /></div>
                                        </div>
                                        <div className="fee-notice-formal" style={{ textAlign: 'center', marginTop: '20px' }}>
                                            Registration Fee: ₹500.00
                                        </div>
                                    </div>
                                )}

                                <div className="form-footer-compact">
                                    {formStep > 1 && (
                                        <button type="button" disabled={isSubmitting} className="f-btn f-btn-outline" onClick={handleBack} style={{ color: 'var(--f-primary)', borderColor: 'var(--f-primary)', padding: '10px 24px' }}>
                                            Back
                                        </button>
                                    )}
                                    <button type="submit" disabled={isSubmitting} className="f-btn f-btn-primary" style={{ flexGrow: 1, padding: '12px 32px' }}>
                                        {isSubmitting ? 'Processing...' : (formStep === 3 ? 'Confirm & Submit Application' : 'Continue to Next Step')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/* Components */
const HighlightItem = ({ icon, title, desc }) => (
    <div className="highlight-row">
        <div className="icon-box-formal">{icon}</div>
        <div className="text-box-formal">
            <h4 style={{ fontWeight: 800 }}>{title}</h4>
            <p>{desc}</p>
        </div>
    </div>
);

const TrackCard = ({ image, title, features, desc, isFeatured, badge }) => (
    <div className={`tech-card-formal ${isFeatured ? 'featured' : ''}`}>
        {badge && <span className="tech-badge-formal">{badge}</span>}
        <div className="card-img-wrap"><img src={image} alt={title} /></div>
        <div className="card-info-wrap">
            <h3 style={{ fontSize: '1.25rem' }}>{title}</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--f-text-muted)', marginBottom: '20px' }}>{desc}</p>
            <ul className="feature-list-formal">
                {features.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
        </div>
    </div>
);

const RoadmapCard = ({ phase, icon, title, desc }) => (
    <div className="roadmap-card-formal">
        {phase && <div className="roadmap-phase-indicator">{phase}</div>}
        <div className="roadmap-header">
            <div className="step-circle">
                <span className="step-icon">{icon}</span>
            </div>
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '16px' }}>{title}</h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--f-text-muted)', lineHeight: '1.6' }}>{desc}</p>
    </div>
);

const BenefitItem = ({ icon, title, desc }) => (
    <div className="institutional-card">
        <div className="inst-icon">{icon}</div>
        <h4 style={{ fontWeight: 800 }}>{title}</h4>
        <p>{desc}</p>
    </div>
);

export default Fellowship;
