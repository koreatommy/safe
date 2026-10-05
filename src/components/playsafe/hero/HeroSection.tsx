import Image from "next/image";
import Link from "next/link";
import { externalLinks } from "@/data/playsafe/links";
import { imagePath } from "@/lib/playsafe/assets";
import { playsafeRoutes } from "@/lib/playsafe/routes";
import "./hero.css";

const STATS = [
  { value: "8", unit: " 유형", label: "주요 위험요소" },
  { value: "18", unit: " 항목", label: "현장 안전성평가 체크리스트" },
  { value: "월 1회+", unit: "", label: "2027. 2. 28.부터 정기 평가·기록 보관" },
];

export function HeroSection() {
  return (
    <section className="hero">
      <div className="wrap">
        <div className="hero-grid">
          <div>
            <span className="eyebrow">신종·유사 어린이놀이시설 안전관리</span>
            <div className="hero-lawline">
              <strong>안전성평가 의무 시행</strong>
              <time dateTime="2027-02-28">2027. 2. 28.부터</time>
            </div>
            <h1>
              놀이는 자유롭게,
              <br />
              안전은 <em>세심하게.</em>
            </h1>
            <p>
              아이들의 새로운 놀이공간에 필요한 안전관리.
              <br />
              우리 공간의 위험을 발견하고, 개선하고,
              <br />
              함께 안심할 수 있는 환경을 만들어갑니다.
            </p>
            <div className="row">
              <Link className="btn primary" href={playsafeRoutes.facilityInfo}>
                우리 시설 안전성평가하기 <span>↗</span>
              </Link>
              <a className="btn" href="#about">
                평가 대상 알아보기 ↓
              </a>
            </div>
            <p className="note">
              2026년 개정법 및 행정안전부 안전관리 가이드라인 기반 ·{" "}
              <a href={externalLinks.revisedLaw} target="_blank" rel="noopener noreferrer">
                개정 법령 보기 ↗
              </a>
            </p>
          </div>
          <div className="hero-visual">
            <div className="photo-frame">
              <Image
                src={imagePath("hero")}
                alt="가이드라인에 제시된 무인키즈카페 놀이공간"
                width={430}
                height={264}
                sizes="(max-width: 720px) 100vw, 560px"
                preload
              />
            </div>
            <div className="float-card top">
              <span className="tiny-badge">SAFE PLAY, HAPPY KIDS</span>
              <p>놀이의 가치는 지키고, 위험은 낮추고</p>
            </div>
            <div className="float-card bottom">
              <span className="circle">✓</span>
              <div>
                <strong>안전의 시작은, 발견입니다.</strong>
                <p>공간을 가장 잘 아는 관리주체와 함께</p>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-bottom">
          <p>
            <b>복잡한 지침을 한눈에.</b>
            <br />
            <small>확인부터 개선까지 이어지는 안전관리</small>
          </p>
          {STATS.map((stat) => (
            <div className="stat" key={stat.label}>
              <strong>
                {stat.value}
                {stat.unit && <span className="stat-unit">{stat.unit}</span>}
              </strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
